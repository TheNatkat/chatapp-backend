const mongoose = require("mongoose");
const userSchema = require("./User");

const ReactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  userName: String,
  emojiId: String,
});

const Reaction = mongoose.model("Reaction", ReactionSchema);
module.exports = Reaction;
