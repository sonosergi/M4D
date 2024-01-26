import { ChatDatabase } from '../databases/chatDatabases.js';
import { z } from 'zod';

const roomInputSchema = z.object({
  user_id: z.string().uuid(),
  roomName: z.string().min(1),
  lat: z.number(), 
  lng: z.number(), 
});

export class ChatModel {
  static async createChatRoom(user_id, roomName, lat, lng) {
    const roomInput = roomInputSchema.parse({ user_id, roomName, lat, lng });
  
    const existingRoom = await ChatDatabase.query(
      'SELECT * FROM chat_rooms WHERE room_name = $1',
      [roomInput.roomName]
    );
  
    if (existingRoom.length > 0) {
      throw new Error('Chat room already exists');
    }
  
    const newRoom = await ChatDatabase.query(
      'INSERT INTO chat_rooms (user_id, room_name, lat, lng) VALUES ($1, $2, $3, $4) RETURNING *',
      [roomInput.user_id, roomInput.roomName, roomInput.lat, roomInput.lng]
    );
  
    return newRoom[0];
  }

  static async getUserbyId(userId) {
    if (!userId) {
      throw new Error('Invalid input');
    }
  
    const user = await ChatDatabase.query(
      'SELECT * FROM users WHERE id = $1',
      [userId]
    );
  
    return user[0] || null;
  }

  static async listChatRooms() {
    const rooms = await ChatDatabase.query(
      'SELECT * FROM chat_rooms'
    );

    return rooms;
  }

  static async getMessages() {
    const messages = await ChatDatabase.query(
      'SELECT * FROM room_messages'
    );
    return messages;
  }

  static async getChatRoom(roomId) {
    if (!roomId) {
      throw new Error('Invalid input');
    }

    const room = await ChatDatabase.query(
      'SELECT * FROM chat_rooms WHERE id = $1',
      [roomId]
    );

    return room[0] || null;
  }

  static async deleteChatRoom(roomName) {
    if (!roomName) {
      throw new Error('Invalid input');
    }

    await ChatDatabase.query(
      'DELETE FROM chat_rooms WHERE name = $1',
      [roomName]
    );
  }

  static async createPrivateChat(user1, user2) {
    if (!user1 || !user2) {
      throw new Error('Invalid input');
    }

    const chatId = [user1, user2].sort().join('-');
    const existingChat = await ChatDatabase.query(
      'SELECT * FROM private_chats WHERE id = $1',
      [chatId]
    );

    if (existingChat.length === 0) {
      await ChatDatabase.query(
        'INSERT INTO private_chats (id, user1_id, user2_id) VALUES ($1, $2, $3)',
        [chatId, user1, user2]
      );
    }

    return { id: chatId, messages: [] };
  }

  static async saveMessageInChatRoom(roomId, userId, content) {
    if (!roomId || !userId || !content) {
      throw new Error('Invalid input');
    }
  
    await ChatDatabase.query(
      'INSERT INTO room_messages (content, user_id, chat_room_id) VALUES ($1, $2, $3)',
      [content, userId, roomId]
    );
  }

  static async saveMessageInPrivateChat(chatId, userId, content) {
    if (!chatId || !userId || !content) {
      throw new Error('Invalid input');
    }

    await ChatDatabase.query(
      'INSERT INTO private_messages (content, user_id, private_chat_id) VALUES ($1, $2, $3)',
      [content, userId, chatId]
    );
  }

  static async getMessagesFromChatRoom(roomName, page = 1, pageSize = 10) {
    if (!roomName || !Number.isInteger(page) || !Number.isInteger(pageSize)) {
      throw new Error('Invalid input');
    }

    const offset = (page - 1) * pageSize;
    const messages = await ChatDatabase.query(
      'SELECT * FROM room_messages WHERE chat_room_id = (SELECT id FROM chat_rooms WHERE name = $1) ORDER BY id DESC LIMIT $2 OFFSET $3',
      [roomName, pageSize, offset]
    );
    return messages;
  }

  static async getMessagesFromPrivateChat(chatId, page = 1, pageSize = 10) {
    if (!chatId || !Number.isInteger(page) || !Number.isInteger(pageSize)) {
      throw new Error('Invalid input');
    }

    const offset = (page - 1) * pageSize;
    const messages = await ChatDatabase.query(
      'SELECT * FROM private_messages WHERE private_chat_id = $1 ORDER BY id DESC LIMIT $2 OFFSET $3',
      [chatId, pageSize, offset]
    );
    return messages;
  }
}

