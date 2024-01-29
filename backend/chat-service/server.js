import express from 'express';
import { createServer } from "http";
import { Server } from "socket.io";
import helmet from 'helmet';
import dotenv from 'dotenv';
import path, { join } from 'path';
import { dirname } from 'path';
import fs from 'fs';
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

const allowedOrigins = ['http://localhost:5173', 'http://localhost:7000'];

app.use(cors({
  origin: function(origin, callback){
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
      var msg = 'The CORS policy for this site does not ' +
                'allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST'],
  credentials: true 
}));

app.use(validateUser);

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: function(origin, callback){
      if(!origin) return callback(null, true);
      if(allowedOrigins.indexOf(origin) === -1){
        var msg = 'The CORS policy for this site does not ' +
                  'allow access from the specified Origin.';
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    methods: ["GET", "POST"],
    credentials: true
  },
  maxHttpBufferSize: 1e8
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
  socket.on("joinRoom", async (roomId) => {
    console.log(`Client is trying to join room ${roomId}`);
    await chatController.handleConnection(socket)(roomId);
    const user = await ChatModel.getUserbyId(socket.userId);
    chatController.connectedUsers[socket.id] = { username: socket.username, ...user };
    io.to(roomId).emit('users', Object.values(chatController.connectedUsers));
  });

  io.emit('ready');

  socket.on('usernameSet', (username) => {
    chatController.handleUsernameSet(socket)(username);
    io.emit('users', Object.values(chatController.connectedUsers));
  });
  
  socket.on('getUsers', (roomId) => {
    const usersWithSocketIds = Object.entries(chatController.connectedUsers).map(([socketId, user]) => ({ socketId, user }));
    io.to(roomId).emit('users', usersWithSocketIds);
    console.log(usersWithSocketIds);
  });

  socket.on('getMessages', async (roomId) => {
    try {
      const messages = await ChatModel.getMessages();
      io.to(roomId).emit('messages', messages);
    } catch (error) {
      console.error('An error occurred while getting messages:', error);
    }
  });

  socket.on("disconnect", () => {
    delete chatController.connectedUsers[socket.id];
    io.emit('users', Object.values(chatController.connectedUsers));
  });

  socket.on('message', (roomId, message) => {
    console.log(`Received message from client: ${message}`);
    chatController.handleMessage(socket)(roomId, message);
  });

  socket.on('file', (roomId, fileBuffer, filename) => {
    console.log(`Received file from client: ${filename}`);
    
    // Convert the fileBuffer back to a Buffer
    const file = Buffer.from(fileBuffer);
    
    // Emit the file as an ArrayBuffer, filename, and username
    io.to(roomId).emit('file', Array.from(file), filename, chatController.connectedUsers[socket.id].username);
  });

});

const PORT = process.env.PORT ?? 7000;
httpServer.listen(PORT, () => {
    console.log(`Listening on port http://localhost:${PORT}`);
});