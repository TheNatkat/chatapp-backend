const mongoose = require("mongoose");
const userSchema = require("./User");
const roomSchema = require("./room");

const MessageSchema = new mongoose.Schema({
  content: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  time: String,
  date: String,
  room: { type: mongoose.Schema.Types.ObjectId, ref: "room" },
  image: { type: String, default: "none" },
  reactions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Reaction" }],
});

const Message = mongoose.model("Message", MessageSchema);
module.exports = Message;
