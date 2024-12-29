require("./config");
const express = require("express");
const userModel = require("./UserModel");
const ChatModel = require("./ChatModel");
const cors = require("cors");
const UserModel = require("./UserModel");
const { response } = require("express");
const socket = require("socket.io");

const app = express();

app.use(cors());
app.use(express.json());

app.post("/signup", async (req, res) => {
  console.log(req.body);
  const user = await userModel.find({ username: req.body.username });
  if (user.length < 1) {
    const result = await new userModel(req.body);
    const data = await result.save();
    res.send(data);
  } else {
    res.send({ exist: "user available" });
  }
});
app.get("/user", async (req, res) => {
  const result = await userModel.find();
  res.send(result);
});
app.post("/login", async (req, res) => {
  const result = await userModel.find({ username: req.body.username });
  if (result.length > 0) res.send(result);
  else res.send({ exist: "No" });
});

app.post("/finduser", async (req, res) => {
  const result = await userModel.find({ _id: req.body.id });
  res.send(result);
});

app.post("/chat", async (req, res) => {
  const result = await new ChatModel(req.body);
  const data = await result.save();
  res.send(data);
});
app.get("/chat/:Sid&:Rid", async (req, res) => {
  const result1 = await ChatModel.find({
    S_id: req.params.Sid,
    R_id: req.params.Rid,
  });
  const result2 = await ChatModel.find({
    R_id: req.params.Sid,
    S_id: req.params.Rid,
  });
  const result = [...result1, ...result2];
  result.sort((a, b) => {
    if (a.createdAt > b.createdAt) return 1;
    else if (a.createdAt < b.createdAt) return -1;
    else return 0;
  });

  res.send(result);
});

const server = app.listen(5000, (req, res) => {
  console.log("running on port 5000");
});

const io = socket(server, {
  cors: {
    origin: "*",
  },
});

let onlineUsers = [];

function AddOnlineUser(userId, socketId) {
  !onlineUsers.some((user) => user.userId === userId) &&
    onlineUsers.push({ userId, socketId });
}

function RemoveOnlineUser(socketId) {
  onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
}

//connection
io.on("connection", (socket) => {
  console.log("socket connected");
  socket.on("OnlineUserID", (currentUserId) => {
    AddOnlineUser(currentUserId, socket.id);
    io.emit("allOnlineUsers", onlineUsers);
  });

  //message

  socket.on("sendingMessage", ({ senderId, receiverId, message }) => {
    console.log(senderId, receiverId, message);
    io.emit("receivingMessage", { senderId, receiverId, message });
  });

  // socket.on("sendingMessage",(sendersId,receiverId,message)=>{
  //     console.log("senders id  ",sendersId )
  //     console.log("receivers id  ",receiverId )
  //     console.log("message  ",message )
  // })

  //disconnect
  socket.on("disconnect", () => {
    console.log("user disconnected");
    RemoveOnlineUser(socket.id);
    io.emit("allOnlineUsers", onlineUsers);
  });
});
