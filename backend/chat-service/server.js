import express from 'express';
import { createServer } from "http";
import { Server } from "socket.io";
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { ChatController } from './controllers/chatControllers.js';
import { chatRoutes } from './v1/routes/chatRoutes.js';
import { validateUser } from './middlewares/validateUser.js';
import { ChatModel } from './models/chatModels.js';
import cors from 'cors';
import cookie from 'cookie';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
app.use(helmet());
app.use(express.json()); 
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, './public')));
app.use(cors({
  origin: 'http://localhost:5173', 
  methods: ['GET', 'POST'],
  credentials: true 
}));
app.use(validateUser);

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use('/', chatRoutes(io));
const chatController = new ChatController(io);


io.use((socket, next) => {
  if (socket.request.headers.cookie) {
    const cookies = cookie.parse(socket.request.headers.cookie);
    const token = cookies['token'];
    console.log(token);
    if (token) {
      jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
        if (err) {
          next(new Error('Invalid token'));
        } else {
          // Asocia el userId con el socket para uso futuro
          socket.userId = user.id;
          next();
        }
      });
    } else {
      next(new Error('Authentication error'));
    }
  } else {
    next(new Error('Authentication error'));
  }
});
io.on("connection", async (socket) => {
  socket.on("joinRoom", chatController.handleConnection(socket));
  socket.on("privateConnect", (roomId) => chatController.handlePrivateConnection(socket)(roomId));
  socket.on("message", (roomId, message) => chatController.handleMessage(socket)(roomId, message));
  socket.on("leaveRoom", (roomId) => chatController.handleLeaveRoom(socket)(roomId));
  socket.on('usernameSet', chatController.handleUsernameSet(socket));
  socket.on('getUsers', () => {
  socket.emit('users', Object.values(chatController.connectedUsers));
  socket.on("joinRoom", chatController.handleConnection(socket));
  });

  socket.on('getMessages', async () => {
    try {
      const messages = await ChatModel.getMessages();
      socket.emit('messages', messages);
    } catch (error) {
      console.error('An error occurred while getting messages:', error);
    }
  });
});

const PORT = process.env.PORT ?? 7000;
httpServer.listen(PORT, () => {
    console.log(`Listening on port http://localhost:${PORT}`);
});