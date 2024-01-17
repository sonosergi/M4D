import { chatController } from '../../controllers/chatControllers.js';
import RateLimiters from '../../middlewares/rateLimiters.js';
import { validateUser } from '../../middlewares/validateUser.js';
import { Router } from 'express';

export const chatRouter = Router();

chatRouter.post('/chat-room', validateUser, RateLimiters.createChatRoomLimiter, chatController.createChatRoom);

chatRouter.delete('/chat-room/:id', validateUser, RateLimiters.deleteChatRoomLimiter, chatController.deleteChatRoom);

chatRouter.post('/chat-room/:id/join', validateUser, RateLimiters.joinChatRoomLimiter, chatController.joinChatRoom);

chatRouter.post('/private-message', validateUser, RateLimiters.privateMessageLimiter, chatController.sendPrivateMessage);

chatRouter.get('/chat-room/:id/history', validateUser, RateLimiters.chatHistoryLimiter, chatController.getChatHistory);

chatRouter.post('/chat-room/:id/moderate', validateUser, RateLimiters.moderationLimiter, chatController.moderateChat);

chatRouter.post('/chat-room/:id/reaction', validateUser, RateLimiters.reactionLimiter, chatController.sendReaction);

chatRouter.post('/chat-room/:id/attachment', validateUser, RateLimiters.attachmentLimiter, chatController.sendAttachment);

chatRouter.post('/chat-room/:id/encrypt', validateUser, RateLimiters.encryptionLimiter, chatController.encryptChat);


