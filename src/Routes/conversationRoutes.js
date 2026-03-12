import express from 'express';
import conversationController from '../Controllers/conversationController.js';
import authMiddleware from '../Middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Conversations
 *   description: Gestión de conversaciones y mensajes
 */

/**
 * @swagger
 * /api/conversations:
 *   get:
 *     tags: [Conversations]
 *     summary: Obtener mis conversaciones
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de conversaciones
 *   post:
 *     tags: [Conversations]
 *     summary: Iniciar una conversación
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [itemId, receiverId]
 *             properties:
 *               itemId:
 *                 type: integer
 *               receiverId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Conversación iniciada
 */
router.get('/', authMiddleware.verifyToken, conversationController.getMyConversations);
router.post('/', authMiddleware.verifyToken, conversationController.startConversation);

/**
 * @swagger
 * /api/conversations/{conversationId}/messages:
 *   get:
 *     tags: [Conversations]
 *     summary: Obtener mensajes de una conversación
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de mensajes
 *   post:
 *     tags: [Conversations]
 *     summary: Enviar un mensaje
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content]
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Mensaje enviado
 */
router.get('/:conversationId/messages', authMiddleware.verifyToken, conversationController.getMessages);
router.post('/:conversationId/messages', authMiddleware.verifyToken, conversationController.sendMessage);

export default router;
