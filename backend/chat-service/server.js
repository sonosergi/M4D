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
      // validate the token here
      next();
    } else {
      next(new Error('Authentication error'));
    }
  } else {
    next(new Error('Authentication error'));
  }
});

io.on("connection", (socket) => {
  socket.on("joinRoom", chatController.handleConnection(socket));
  socket.on("privateConnect", chatController.handlePrivateConnection(socket));
  socket.on("message", chatController.handleMessage(socket));
  socket.on("leaveRoom", chatController.handleLeaveRoom(socket));
});

const PORT = process.env.PORT ?? 7000;
httpServer.listen(PORT, () => {
    console.log(`Listening on port http://localhost:${PORT}`);
});