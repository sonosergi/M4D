import { ChatModel } from '../models/chatModels.js';
import { z } from 'zod';

const roomInputSchema = z.object({
  roomName: z.string().min(1),
  locationId: z.number().int(), // changed from location_id to locationId
});

export class ChatController {
  constructor(io) {
    this.io = io;
  }

  handleConnection = (socket) => async (roomId) => {
    try {
      const chatRoom = await ChatModel.getChatRoom(roomId);
      if (chatRoom) {
        socket.join(roomId);
        console.log(`Client joined room ${roomId}`);
      } else {
        socket.emit('error', 'Chat room does not exist');
        console.log(`Client tried to join non-existent room ${roomId}`);
      }
    } catch (error) {
      socket.emit('error', 'An error occurred while joining the room');
    }
  }

  createChatRoom = async (req, res, next) => {
    try {
      console.log(req.body); // Add this line to log the request body
  
      // Check if the user is authenticated
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
  
      // Extract the user_id from req.user
      const userId = req.user.id;
  
      // Parse the request body
      const roomInput = roomInputSchema.parse({ user_id: userId, ...req.body });
  
      // Log the values that will be passed to createChatRoom
      console.log(`roomName: ${roomInput.roomName}, locationId: ${roomInput.locationId}, userId: ${userId}`);
  
      // Include the user_id in the call to createChatRoom
      const newChatRoom = await ChatModel.createChatRoom(userId, roomInput.roomName, roomInput.locationId);
  
      res.status(201).json({ message: 'Chat room created', newChatRoom });
    } catch (error) {
      console.error(error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.message });
      } else if (error.message === 'Chat room already exists') {
        res.status(400).json({ message: 'Chat room already exists' });
      } else {
        next(new Error('An error occurred while creating the chat room'));
      }
    }
  }

  listChatRooms = async (req, res, next) => {
    try {
      const chatRooms = await ChatModel.listChatRooms();
      res.json(chatRooms);
      console.log(chatRooms);
    } catch (error) {
      next(error);
    }
  }

  handlePrivateConnection = (socket) => async (user1, user2) => {
    try {
      const privateChat = await ChatModel.createPrivateChat(user1, user2);
      if (privateChat) {
        socket.join(privateChat.id);
      } else {
        socket.emit('error', 'Private chat does not exist');
      }
    } catch (error) {
      socket.emit('error', 'An error occurred while joining the private chat');
    }
  }

  handleMessage = (socket) => async (roomId, message, userId) => {
    try {
      await ChatModel.saveMessageInChatRoom(roomId, userId, message);
      this.io.to(roomId).emit("message", message);
    } catch (error) {
      socket.emit('error', 'An error occurred while sending the message');
    }
  }

  handlePrivateMessage = (socket) => async (chatId, message, userId) => {
    try {
      await ChatModel.saveMessageInPrivateChat(chatId, userId, message);
      socket.to(chatId).emit("message", message);
    } catch (error) {
      socket.emit('error', 'An error occurred while sending the private message');
    }
  }

  fetchMessages = async (req, res, next) => {
    try {
      const { roomName, page, pageSize } = req.query;
      const messages = await ChatModel.getMessagesFromChatRoom(roomName, page, pageSize);
      res.json(messages);
    } catch (error) {
      next(error);
    }
  }

  fetchPrivateMessages = async (req, res, next) => {
    try {
      const { chatId, page, pageSize } = req.query;
      const messages = await ChatModel.getMessagesFromPrivateChat(chatId, page, pageSize);
      res.json(messages);
    } catch (error) {
      next(error);
    }
  }

  handleLeaveRoom = (socket) => (roomId) => {
    socket.leave(roomId);
  }

  deleteChatRoom = async (req, res, next) => {
    try {
      const roomId = req.params.id;
      await ChatModel.deleteChatRoom(roomId);
      this.io.socketsLeave(roomId);
      res.status(200).json({ message: 'Chat room deleted' });
    } catch (error) {
      next(error);
    }
  }

  disconnectSockets = async (req, res, next) => {
    try {
      this.io.disconnectSockets();
      res.status(200).json({ message: 'All sockets disconnected' });
    } catch (error) {
      next(error);
    }
  }

  fetchSockets = async (req, res, next) => {
    try {
      const sockets = await this.io.fetchSockets();
      res.json(sockets);
    } catch (error) {
      next(error);
    }
  }
}

