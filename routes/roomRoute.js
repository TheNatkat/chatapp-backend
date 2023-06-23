const express = require("express");
const User = require("../model/User");
const router = express.Router();
const Room = require("../model/room");

const validateToken = require("../middleware/validateTokenHandler");
router.use(validateToken);

router.get("/", async (req, res) => {
  try {
    const rooms = await Room.find({});
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: "Error while getting all rooms" });
  }
});

router.put("/adduser", async (req, res) => {
  try {
    const { roomName, userId } = req.body;
    const room = await Room.findOne({ name: roomName });
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const checkUserInRoom = await Room.findOne({
      _id: room._id,
      users: user._id,
    });

    if (checkUserInRoom) {
      return res.json("user already in room");
    }

    await Room.findByIdAndUpdate(room._id, {
      $addToSet: { users: user },
    });

    res.json("user added successfully");
  } catch (err) {
    console.error("Error while adding user to room:", err);
    res.status(500).json({ error: "Error while adding user to room" });
  }
});

router.delete("/removeuser/:roomName/:userId", async (req, res) => {
  try {
    const { roomName, userId } = req.params;
    const room = await Room.findOne({ name: roomName });
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const checkUserInRoom = room.users.includes(user._id);

    if (!checkUserInRoom) {
      return res.json("User is not in the room");
    }

    room.users = room.users.filter((id) => id.toString() !== user._id.toString());
    await room.save();

    res.json("User removed successfully");
  } catch (err) {
    console.error("Error while removing user from room:", err);
    res.status(500).json({ error: "Error while removing user from room" });
  }
});



router.get("/checkuser/:roomName/:userid", async (req, res) => {
  try {
    const { roomName, userid } = req.params;
    const user = await User.findById(userid);
    const room = await Room.findOne({ name: roomName });

    if (!room) {
      return res.status(404).json({ error: "room not found" });
    }

    const checkUserInRoom = room.users.find((singleUser) =>
      singleUser.equals(user._id)
    );
    if (checkUserInRoom) {
      return res.status(200).json(true);
    } else {
      return res.status(200).json(false);
    }
  } catch (err) {
    console.error("Error while checking user in room:", err);
    res.status(500).json({ error: "Error while checking user in room" });
  }
});

router.get("/getusers/:roomName", async (req, res) => {
  try {
    const roomName = req.params.roomName;
    const room = await Room.findOne({ name: roomName });
    if (!room) {
      return res.status(404).json({ error: "room not found" });
    }
    const populatedRoom = await Room.findById(room._id).populate("users");

    res.json(populatedRoom);
  } catch (err) {
    console.error("Error while adding user to room:", err);
    res.status(500).json({ error: "Error while adding user to room" });
  }
});

module.exports = router;
