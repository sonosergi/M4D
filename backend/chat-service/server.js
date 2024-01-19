import express from 'express';
import { Server } from 'http';
import { Server as IoServer } from 'socket.io';
import { chatRoutes } from './v1/routes/chatRoutes.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.static('./public'));
app.use(express.json()); 

const httpServer = new Server(app);
const io = new IoServer(httpServer, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

app.use((req, res, next) => {
  req.io = io; 
  next();
});

app.use('/', chatRoutes);

io.on("connection", async (socket) => {
  socket.on("joinRoom", async (roomId) => {
    const chatRoom = await ChatControllers.getChatRoom(roomId);
    if (chatRoom) {
      socket.join(roomId);
    } else {
      socket.emit('error', 'Chat room does not exist');
    }
  });

  socket.on("privateConnect", async (user1, user2) => {
    const privateChat = await ChatControllers.getPrivateChat(user1, user2);
    if (privateChat) {
      socket.join(privateChat.id);
    } else {
      socket.emit('error', 'Private chat does not exist');
    }
  });

  socket.on("message", (roomId, message) => {
    io.to(roomId).emit("message", message);
  });

  socket.on("leaveRoom", (roomId) => {
    socket.leave(roomId);
  });
});

const PORT = process.env.PORT ?? 3200;
httpServer.listen(PORT, () => {
    console.log(`Listening on port http://localhost:${PORT}`);
});