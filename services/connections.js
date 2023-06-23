const mongoose = require("mongoose");
require('dotenv').config();

const dbHost = process.env.DB_HOST;
const dbPort = process.env.DB_PORT;
mongoose
  .connect(
    `mongodb+srv://${dbHost}:${dbPort}@chit-chat.zpzafnh.mongodb.net/?retryWrites=true&w=majority`
  )
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => {
    console.log("MongoDB connection error:", error);
  });
