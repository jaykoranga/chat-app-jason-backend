const express = require("express");
const { Server } = require("socket.io");
const { chats } = require("./data/data.js");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./db.js");
const userRoutes = require("./routes/user.routes.js");
const chatRoutes = require("./routes/chat.routes.js");
const messageRouter = require("./routes/message.routes.js");
const { errorHandler, notFound } = require("./middlewares/errorHandlers.js");
dotenv.config();
const port = process.env.PORT;
const app = express();

connectDB();
app.use(cors());

app.use(express.json());

app.get("/home", (req, res) => {
  res.send("hello");
});

app.use("/api/users", userRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRouter);
app.use(notFound);
app.use(errorHandler);
const server = app.listen(port, () => {
  console.log(`app is listening on port :${port}`);
});
const io = new Server(server, {
  pingTimeout: 60000,
  cors: {},
});

io.on("connection", (socket) => {
  socket.on("setup", (userData) => {
    if(userData){
      console.log(`user connected :${userData.name}`);
      socket.emit("connected");
     }
  });
  socket.on('join-room', (chatId) => {
    socket.join(chatId)
    console.log(`userid : ${chatId}, joined a room `);
  });
  socket.off('new message',()=>{

  })
  socket.on("new message",(messageReceived)=>{
    socket.broadcast.to(messageReceived.chat._id).emit('message recieved',messageReceived)
  })

  socket.on("disconnect", () => {
    console.log("A user disconnected");
    socket.removeAllListeners(); // Remove event listeners to prevent duplicate messages
  });
});
