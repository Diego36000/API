import express from 'express';
import conversationController from '../Controllers/conversationController.js';
import authMiddleware from '../Middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware.verifyToken, conversationController.getMyConversations);
router.post('/', authMiddleware.verifyToken, conversationController.startConversation);
router.get('/:conversationId/messages', authMiddleware.verifyToken, conversationController.getMessages);
router.post('/:conversationId/messages', authMiddleware.verifyToken, conversationController.sendMessage);

export default router;
