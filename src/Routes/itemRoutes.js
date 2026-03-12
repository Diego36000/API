import express from 'express';
import itemController from '../Controllers/itemController.js';
import authMiddleware from '../Middleware/authMiddleware.js';
import upload from '../Middleware/uploadMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Items
 *   description: Gestión de artículos
 */

/**
 * @swagger
 * /api/items:
 *   get:
 *     tags: [Items]
 *     summary: Obtener todos los artículos
 *     security: []
 *     responses:
 *       200:
 *         description: Lista de artículos
 *   post:
 *     tags: [Items]
 *     summary: Crear un artículo
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, price, categoryId]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               categoryId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Artículo creado
 */
router.get('/', itemController.getAllItems);
router.post('/', authMiddleware.verifyToken, itemController.createItem);

/**
 * @swagger
 * /api/items/seller/{sellerId}:
 *   get:
 *     tags: [Items]
 *     summary: Obtener artículos de un vendedor
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sellerId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de artículos del vendedor
 */
router.get('/seller/:sellerId', authMiddleware.verifyToken, itemController.getItemsBySeller);

/**
 * @swagger
 * /api/items/{itemId}:
 *   get:
 *     tags: [Items]
 *     summary: Obtener un artículo por ID
 *     security: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Artículo encontrado
 *       404:
 *         description: No encontrado
 *   put:
 *     tags: [Items]
 *     summary: Actualizar un artículo
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       200:
 *         description: Artículo actualizado
 *   delete:
 *     tags: [Items]
 *     summary: Eliminar un artículo
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Artículo eliminado
 */
router.get('/:itemId', itemController.getItemById);
router.put('/:itemId', authMiddleware.verifyToken, itemController.updateItem);
router.delete('/:itemId', authMiddleware.verifyToken, itemController.deleteItem);

/**
 * @swagger
 * /api/items/{itemId}/status:
 *   patch:
 *     tags: [Items]
 *     summary: Actualizar el estado de un artículo
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [available, sold, reserved]
 *     responses:
 *       200:
 *         description: Estado actualizado
 */
router.patch('/:itemId/status', authMiddleware.verifyToken, itemController.updateItemStatus);

/**
 * @swagger
 * /api/items/{itemId}/upload-photos:
 *   post:
 *     tags: [Items]
 *     summary: Subir fotos de un artículo
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photos:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Fotos subidas
 */
router.post('/:itemId/upload-photos', authMiddleware.verifyToken, upload.array('photos'), itemController.uploadItemPhotos);

export default router;
