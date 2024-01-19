import { ChatDatabase as chatdb } from '../databases/chatDatabases.js'

export class ChatModel {

    static async createChatRoom(roomName) {
        if (!roomName) {
            throw new Error('Room name is required');
        }
    
        try {
            const result = await chatdb.query(`
                INSERT INTO chat_rooms (name) 
                VALUES ($1) 
                ON CONFLICT (name) DO NOTHING 
                RETURNING *`, [roomName]);
            if (!result || result.length === 0) {
                return 'Chat room already exists';
            }
            return result[0];
        } catch (error) {
            console.error('Error creating chat room: ', error);
            throw error;
        }
    }

    static async deleteChatRoom(roomId) {
        if (!roomId) {
            throw new Error('Room ID is required');
        }
    
        try {
            const result = await chatdb.query('DELETE FROM chat_rooms WHERE id = $1 RETURNING *', [roomId]);
            return result[0];
        } catch (error) {
            console.error('Error deleting chat room: ', error);
            throw error;
        }
    }

    static async getMessages() {
        try {
            const result = await chatdb.query('SELECT * FROM messages ORDER BY id DESC LIMIT 100');
            return result.rows.reverse();
        } catch (error) {
            console.error('Error getting messages: ', error);
            throw error;
        }
    }

    static async insertMessage(msg, username) {
        if (!msg || !username) {
            throw new Error('Both message and username are required');
        }

        try {
            const result = await chatdb.query('INSERT INTO messages (content, username) VALUES ($1, $2) RETURNING id', [msg, username]);
            return result.rows[0].id;
        } catch (error) {
            console.error('Error inserting message: ', error);
            throw error;
        }
    }

    static async getChatRoom(roomName) {
        if (!roomName) {
            throw new Error('Room name is required');
        }
    
        try {
            const result = await chatdb.query('SELECT * FROM chat_rooms WHERE name = $1', [roomName]);
            if (!result || result.length === 0) {
                throw new Error('Chat room not found');
            }
            return result[0];
        } catch (error) {
            console.error('Error getting chat room: ', error);
            throw error;
        }
    }

    static async createPrivateChat(user1, user2) {
        if (!user1 || !user2) {
            throw new Error('Both user1 and user2 are required');
        }

        try {
            const result = await chatdb.query('INSERT INTO private_chats (user1, user2) VALUES ($1, $2) RETURNING *', [user1, user2]);
            return result.rows[0];
        } catch (error) {
            console.error('Error creating private chat: ', error);
            throw error;
        }
    }

    static async listChatRooms() {
        try {
            const result = await chatdb.query('SELECT * FROM chat_rooms');
            console.log('Query result:', result);
            return result.rows;
        } catch (error) {
            console.error('Error listing chat rooms: ', error);
            throw error;
        }
    }
}