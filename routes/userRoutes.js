const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../model/User");
const router = express.Router();
const jwt = require("jsonwebtoken");

router.post("/", async (req, res) => {
  try {
    const { name, email, password, picture } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      picture,
      password: hashedPassword,
    });

    await newUser.save();
    res
      .status(201)
      .json({ message: "User created successfully", data: newUser });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Internal server error", errorMessage: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "E-mail not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Incorrect Password" });
    } else {
      user.status = "online";
      await user.save();
      const accessToken = jwt.sign(
        {
          user: {
            username: user.username,
            email: user.email,
            id: user.id,
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
      );

      res.status(200).json({ accessToken, data: user });
    }
  } catch (e) {
    res.status(400).json(e.message);
  }
});

module.exports = router;
