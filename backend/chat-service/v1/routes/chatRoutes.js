import { Router } from 'express';
import { handleConnection } from '../../controllers/chatControllers.js';
//import jwt from 'jsonwebtoken';

export const chatRoutes = Router();

// Middleware de autenticación
// chatRoutes.use((req, res, next) => {
//     const authHeader = req.headers['authorization'];
//     const token = authHeader && authHeader.split(' ')[1];

//     if (token == null) return res.sendStatus(401); // Si no hay token, devuelve un error 401

//     jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
//         if (err) return res.sendStatus(403); // Si el token es inválido, devuelve un error 403
//         req.user = user;
//         next(); // Si todo está bien, pasa al siguiente middleware
//     });
// });

chatRoutes.get('/', (req, res) => {
    const connectedUsers = {}
    let messages = []

    io.on('connection', (socket) => handleConnection(socket, io, connectedUsers, messages))
});

app.post('/chat_rooms', async (req, res) => {
  const chatRoom = await chatRoomModel.createChatRoom(req.body.name)
  res.json(chatRoom)
})

app.delete('/chat_rooms/:id', async (req, res) => {
  const chatRoom = await chatRoomModel.deleteChatRoom(req.params.id)
  res.json(chatRoom)
})