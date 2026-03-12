import express from 'express';
import favoriteController from '../Controllers/favoriteController.js';
import authMiddleware from '../Middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Favorites
 *   description: Gestión de favoritos
 */

/**
 * @swagger
 * /api/favorites:
 *   get:
 *     tags: [Favorites]
 *     summary: Obtener mis favoritos
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de artículos favoritos
 */
router.get('/', authMiddleware.verifyToken, favoriteController.getMyFavorites);

/**
 * @swagger
 * /api/favorites/{itemId}:
 *   post:
 *     tags: [Favorites]
 *     summary: Añadir un artículo a favoritos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       201:
 *         description: Añadido a favoritos
 *   delete:
 *     tags: [Favorites]
 *     summary: Eliminar un artículo de favoritos
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
 *         description: Eliminado de favoritos
 */
router.post('/:itemId', authMiddleware.verifyToken, favoriteController.addFavorite);
router.delete('/:itemId', authMiddleware.verifyToken, favoriteController.removeFavorite);

export default router;
