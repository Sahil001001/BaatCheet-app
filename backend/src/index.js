import express from "express";
import authRoutes from "./routes/auth.routes.js";
import dotenv from "dotenv";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
import messageRoutes from "./routes/message.routes.js";
import cors from "cors";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import Message from "./models/message.model.js";
import path from "path";

dotenv.config({ path: './.env' });

const app = express();
const port = process.env.PORT || 3008;
const __dirname = path.resolve();

connectDB();

app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());

app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true,
}));

app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoutes);

app.get("/favicon.ico", (req, res) => res.sendStatus(204));

app.get("/debug/online-users", (req, res) => {
  const onlineUsersArray = Array.from(onlineUsers).map(id => String(id));
  res.json({
    onlineUsers: onlineUsersArray,
    userSockets: Array.from(userSockets.entries()).map(([userId, sockets]) => ({
      userId: String(userId),
      socketCount: sockets.size
    }))
  });
});

if(process.env.NODE_ENV==="production"){
  app.use(express.static(path.join(__dirname,"../frontend/dist"))); 
} else {
  app.get("/", (req, res) => {
    res.send("Welcome to Home Route");
  });
}

app.get("*",(req,res)=>{
  if(process.env.NODE_ENV==="production"){
    res.sendFile(path.join(__dirname,"../frontend","dist","index.html"));
  } else {
    res.send("Route not found");
  }
});

const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  },
});

const onlineUsers = new Set();
const userSockets = new Map();

io.on("connection", (socket) => {
  socket.on("join", (userId) => {
    socket.join(userId);
    if (!userSockets.has(userId)) userSockets.set(userId, new Set());
    userSockets.get(userId).add(socket.id);
    onlineUsers.add(userId);
    
    setTimeout(() => {
      const onlineUsersArray = Array.from(onlineUsers).map(id => String(id));
      io.emit("online_users", onlineUsersArray);
    }, 100);
    
    socket.data.userId = userId;
  });

  socket.on("disconnecting", () => {
    const userId = socket.data.userId;
    if (userId && userSockets.has(userId)) {
      userSockets.get(userId).delete(socket.id);
      if (userSockets.get(userId).size === 0) {
        userSockets.delete(userId);
        onlineUsers.delete(userId);
      }
    }
  });

  socket.on("disconnect", () => {
    const userId = socket.data.userId;
    const onlineUsersArray = Array.from(onlineUsers).map(id => String(id));
    io.emit("online_users", onlineUsersArray);
  });

  socket.on("send_message", async (data) => {
    const newMessage = new Message({
      senderId: data.senderId,
      receiverId: data.receiverId,
      text: data.text,
      image: data.image,
    });
    await newMessage.save();
    io.to(data.receiverId).to(data.senderId).emit("receive_message", newMessage);
  });

  socket.on("delete_message", (data) => {
    io.to(data.receiverId).to(data.senderId).emit("delete_message", { messageId: data.messageId });
  });

  socket.on("mark_seen", async ({ senderId, receiverId }) => {
    const updated = await Message.updateMany({
      senderId,
      receiverId,
      seen: false
    }, { seen: true, seenAt: new Date() });
    const seenMessages = await Message.find({
      senderId,
      receiverId,
      seen: true
    }).select('_id');
    io.to(senderId).emit("messages_seen", { senderId, receiverId, messageIds: seenMessages.map(m => m._id) });
  });

  socket.on("logout", () => {
    const userId = socket.data.userId;
    if (userId && userSockets.has(userId)) {
      userSockets.get(userId).delete(socket.id);
      if (userSockets.get(userId).size === 0) {
        userSockets.delete(userId);
        onlineUsers.delete(userId);
      }
    }
    const onlineUsersArray = Array.from(onlineUsers).map(id => String(id));
    io.emit("online_users", onlineUsersArray);
  });
});

server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}🚀`);
});
