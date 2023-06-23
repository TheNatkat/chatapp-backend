const mongoose = require("mongoose");
const User = require("./User");

const roomSchema = new mongoose.Schema({
  name: { type: String, lowercase: true, unique: true },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
  description: String,
  updated_at: { type: Date, default: Date.now },
});

const Room = mongoose.model("Room", roomSchema);

module.exports = Room;
