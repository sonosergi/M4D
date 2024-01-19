import { Router } from 'express';

import ChatControllers from '../../controllers/chatControllers.js';
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

// Crear una sala de chat
chatRoutes.post('/chat_rooms', ChatControllers.createChatRoom);

// Gestionar salas de chat (eliminar)
chatRoutes.delete('/chat_rooms/:id', ChatControllers.deleteChatRoom);

// Listar salas de chat
chatRoutes.get('/chat_rooms', ChatControllers.listChatRooms);
