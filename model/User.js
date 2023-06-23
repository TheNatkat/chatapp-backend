const { isEmail } = require("validator");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Can't be empty"],
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    indexedDB: true,
    validate: [isEmail, "invalid email"],
  },
  password: {
    type: String,
    required: [true, "Can't be empty"],
  },
  picture: {
    type: String,
  },
  status: {
    type: String,
    default: "online",
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
