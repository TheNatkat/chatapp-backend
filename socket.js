const Message = require("./model/message");
const User = require("./model/User");
const Room = require("./model/room");
const Reaction = require("./model/reaction");
const validateToken = require("./middleware/validateTokenHandler");

async function getLastMessagesFromRoom(room) {
  const checkRoom = await Room.findOne({ name: room });
  if (!checkRoom) return [];

  const populatedRoom = await Room.findById(checkRoom._id).populate({
    path: "messages",
    populate: [
      { path: "user", model: "User" },
      { path: "reactions", model: "Reaction" },
    ],
  });
  return populatedRoom.messages;
}

module.exports = (io,app) => {
    
  app.delete("/delete/:roomname", validateToken, async (req, res) => {
    try {
      const { messageId } = req.body;
      const result = await Message.deleteOne({ _id: messageId });

      if (result.deletedCount === 0) {
        return res.status(404).json({ error: "Message not found" });
      }
      res.json({ success: true });
      const roomName = req.params.roomname;

      const messages = await getLastMessagesFromRoom(roomName);

      io.emit("messages-updated", {
        messages: messages,
        roomName: roomName,
      });
    } catch (error) {
      console.error("Error while deleting message:", error);
      res.status(500).json({ error: "Error while deleting message" });
    }
  });

  app.post("/addemoji", validateToken, async (req, res) => {
    try {
      const { userId, emojiId, messageId, currentRoom } = req.body;
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const message = await Message.findById(messageId);
      if (!message) {
        return res.status(404).json({ error: "Message not found" });
      }

      const reaction = new Reaction({
        user: user._id,
        userName: user.name,
        emojiId,
      });

      await reaction.save();

      message.reactions.push(reaction);
      await message.save();

      const roomMessages = await getLastMessagesFromRoom(currentRoom);
      io.emit("messages-updated", {
        messages: roomMessages,
        roomName: currentRoom,
      });

      res.json({ success: true });
    } catch (err) {
      console.error("Error while adding emoji:", err);
      res.status(500).json({ error: "Error while adding emoji" });
    }
  });

  app.post("/createroom", validateToken, async (req, res) => {
    try {
      const { roomName, description } = req.body;

      const checkRoom = await Room.findOne({ name: roomName });

      if (checkRoom) {
        return res.status(200).json({ message: "Room already exists" });
      }
      const room = new Room({
        name: roomName,
        users: [],
        description: description,
      });
      await room.save();
      const rooms = await Room.find({});
      io.emit("new-channel", rooms);
      res.status(200).json({ message: "Room created successfully", room });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  });

  app.delete("/logout", async (req, res) => {
    try {
      const { _id } = req.body.data;
      const user = await User.findOne({ _id });
      user.status = "offline";
      await user.save();
      const members = await User.find({});
      io.emit("refersh-members", members);
      res.status(200).send();
    } catch (e) {
      res.status(400).send();
    }
  });

  io.on("connection", (socket) => {

    socket.on("new-user", async () => {
      const members = await User.find();
      io.emit("new-user", members);
    });

    socket.on("user-join-room", async (roomName) => {
      const room = await Room.findOne({ name: roomName }).populate("users");
      const members = room.users;
      io.emit("set-room-user", { members, roomName });
    });

    socket.on("new-channel", async () => {
      const rooms = await Room.find({});
      io.emit("new-user", rooms);
    });

    socket.on("join-room", async (newRoom, previousRoom) => {
      socket.join(newRoom);
      socket.leave(previousRoom);
      let roomMessages = await getLastMessagesFromRoom(newRoom);
      io.to(newRoom).emit("room-messages", roomMessages);
    });

    socket.on(
      "message-room",
      async (room, content, imageUrl, sender, time, date) => {
        const checkRoom = await Room.findOne({ name: room });
        const newMessage = await Message.create({
          content,
          user: sender,
          time,
          image: imageUrl,
          date,
          room: checkRoom._id,
        });
        checkRoom.messages.push(newMessage);
        await checkRoom.save();

        const populatedMessages = await getLastMessagesFromRoom(room);

        io.to(room).emit("room-messages", populatedMessages);
      }
    );
  });
};
