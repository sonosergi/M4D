import express from 'express';
import { createServer } from "http";
import { Server } from "socket.io";
import helmet from 'helmet';
// import passport from 'passport';
import dotenv from 'dotenv';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { ChatController } from './controllers/chatControllers.js';
import { chatRoutes } from './v1/routes/chatRoutes.js';
// import headersMiddleware from './middlewares/headers.js';
// import errorHandler from './middlewares/errorHandler.js';
// import rateLimiter from './middlewares/rateLimit.js';
// import { validateUser } from './middlewares/validateUser.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
app.use(express.json()); 
// headersMiddleware(app);
// app.use(rateLimiter);
// app.use(validateUser);
// app.use(errorHandler);

app.use(express.static(path.join(__dirname, './public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, './public/chat.html'))
})

const httpServer = createServer(app);
const io = new Server(httpServer, {
  connectionStateRecorvery: {}
});

const chatController = new ChatController(io);
app.use('/', chatRoutes(io));
// Apply helmet middleware to Socket.IO
io.engine.use(helmet());

// Apply passport-jwt middleware to Socket.IO
// io.engine.use((req, res, next) => {
//   const isHandshake = req._query.sid === undefined;
//   if (isHandshake) {
//     passport.authenticate("jwt", { session: false })(req, res, next);
//   } else {
//     next();
//   }
// });

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