// routes/chatRoutes.js
import { Router } from 'express';
import { ChatController } from '../../controllers/chatControllers.js';

export const chatRoutes = (io) => {
  const chatRoutes = Router();
  const chatController = new ChatController(io);

  chatRoutes.post('/chat_rooms', (req, res, next) => chatController.createChatRoom(req, res, next));
  chatRoutes.delete('/chat_rooms/:id', (req, res, next) => chatController.deleteChatRoom(req, res, next));
  chatRoutes.get('/chat_rooms', (req, res, next) => chatController.listChatRooms(req, res, next));

  chatRoutes.post('/chat_rooms/:id/messages', (req, res, next) => chatController.handleMessage(req, res, next));
  chatRoutes.get('/chat_rooms/:id/messages', (req, res, next) => chatController.fetchMessages(req, res, next));

  chatRoutes.post('/private_chats', (req, res, next) => chatController.handlePrivateConnection(req, res, next));
  chatRoutes.get('/private_chats/:id', (req, res, next) => chatController.fetchPrivateChat(req, res, next));

  chatRoutes.post('/private_chats/:id/messages', (req, res, next) => chatController.handlePrivateMessage(req, res, next));
  chatRoutes.get('/private_chats/:id/messages', (req, res, next) => chatController.fetchPrivateMessages(req, res, next));

  chatRoutes.post('/disconnect_sockets', (req, res, next) => chatController.disconnectSockets(req, res, next));
  chatRoutes.get('/fetch_sockets', (req, res, next) => chatController.fetchSockets(req, res, next));

  return chatRoutes;
};