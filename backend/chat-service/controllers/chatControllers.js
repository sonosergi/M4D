import { ChatModel } from '../models/chatModels.js';

class ChatController {
    constructor(chatModel) {
        this.chatModel = chatModel;
    }

    handleConnection = async (req, res, next) => {
        try {
            const room = req.params.room;
            const chatRoom = await this.chatModel.getChatRoom(room);
            if (!chatRoom) {
                return res.status(404).json({ message: 'Chat room does not exist' });
            }
            if (req.user && req.user.id) {
                req.io.to(room).emit('userConnected', req.user.id);
            }
            res.json(chatRoom);
        } catch (error) {
            next(error);
        }
    }

    createChatRoom = async (req, res) => {
        try {
            const roomName = req.body.roomName; 
            const newChatRoom = await this.chatModel.createChatRoom(roomName);
            res.status(201).json({ message: 'Chat room created', newChatRoom });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    handlePrivateConnection = async (req, res) => {
        try {
            const user1 = req.params.user1;
            const user2 = req.params.user2;
            const room = `${user1}-${user2}`;
            if (req.user && req.user.id) {
                req.io.to(room).emit('privateChatStarted', { user1, user2 });
            }
            const privateChat = await this.chatModel.createPrivateChat(user1, user2);
            res.json(privateChat);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    deleteChatRoom = async (req, res) => {
        try {
            const roomId = req.params.id;
            await this.chatModel.deleteChatRoom(roomId);
            res.status(200).json({ message: 'Chat room deleted' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    listChatRooms = async (req, res) => {
        try {
            console.log('Listing chat rooms...');
            const chatRooms = await this.chatModel.listChatRooms();
            console.log('Chat rooms:', chatRooms);
            res.json(chatRooms);
        } catch (error) {
            console.error('Error listing chat rooms:', error);
            res.status(500).json({ message: error.message });
        }
    }
}

export default new ChatController(ChatModel);