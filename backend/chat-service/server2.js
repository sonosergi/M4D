// server.js
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
import cors from 'cors';
import cookie from 'cookie';

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

const chatController = new ChatController(io);

app.use('/', chatRoutes(io));

io.use((socket, next) => {
  if (socket.request.headers.cookie) {
    const cookies = cookie.parse(socket.request.headers.cookie);
    const token = cookies['token'];
    if (token) {
      next();
    } else {
      next(new Error('Authentication error'));
    }
  } else {
    next(new Error('Authentication error'));
  }
});

io.on("connection", async (socket) => {
  socket.on("joinRoom", (roomId) => {
    chatController.handleConnection(socket)(roomId);
  });

  socket.on("privateConnect", (roomId) => {
    chatController.handlePrivateConnection(socket)(roomId);
  });

  socket.on("message", (message) => {
    chatController.handleMessage(socket)(message);
  });

  socket.on("leaveRoom", (roomId) => {
    chatController.handleLeaveRoom(socket)(roomId);
  });

  socket.on("disconnect", () => {
    // Handle disconnection here
  });

  socket.on("error", (error) => {
    // Handle error here
  });
});

httpServer.listen(7000, () => {
  console.log('chat server running on port 7000')
});