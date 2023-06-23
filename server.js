const express = require("express");
const cors = require("cors");
const userRoute = require("./routes/userRoutes");
const roomRouter = require("./routes/roomRoute");
require('dotenv').config();
const app = express();
app.use(express.urlencoded({ extented: true }));
app.use(express.json());
app.use(cors());

app.use("/users", userRoute);
app.use("/rooms", roomRouter);

require("./services/connections");

const server = require("http").createServer(app);
const PORT = process.env.PORT || 5001;

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

require("./socket")(io, app);  

server.listen(PORT, "0.0.0.0", () => {
  console.log(`listening on port ${PORT}`);
});
