import express from 'express';
import reviewController from '../Controllers/reviewController.js';
import authMiddleware from '../Middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Gestión de reseñas
 */

/**
 * @swagger
 * /api/reviews/user/{userId}:
 *   get:
 *     tags: [Reviews]
 *     summary: Obtener reseñas de un usuario
 *     security: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de reseñas
 */
router.get('/user/:userId', reviewController.getReviewsForUser);

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     tags: [Reviews]
 *     summary: Crear una reseña
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [reviewedUserId, rating]
 *             properties:
 *               reviewedUserId:
 *                 type: integer
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Reseña creada
 */
router.post('/', authMiddleware.verifyToken, reviewController.createReview);

/**
 * @swagger
 * /api/reviews/{reviewId}:
 *   delete:
 *     tags: [Reviews]
 *     summary: Eliminar una reseña
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Reseña eliminada
 */
router.delete('/:reviewId', authMiddleware.verifyToken, reviewController.deleteReview);

export default router;
