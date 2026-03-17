import express from 'express';
import categoryController from '../Controllers/categoryController.js';
import authMiddleware from '../Middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Gestión de categorías
 */

/**
 * @swagger
 * /api/categories:
 *   get:
 *     tags: [Categories]
 *     summary: Obtener todas las categorías
 *     security: []
 *     responses:
 *       200:
 *         description: Lista de categorías
 *   post:
 *     tags: [Categories]
 *     summary: Crear una categoría
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Categoría creada
 */
router.get('/', categoryController.getAllCategories);
router.post('/', authMiddleware.verifyToken, authMiddleware.verifyAdmin, categoryController.createCategory);

/**
 * @swagger
 * /api/categories/{categoryId}:
 *   delete:
 *     tags: [Categories]
 *     summary: Eliminar una categoría
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Categoría eliminada
 */
router.delete('/:categoryId', authMiddleware.verifyToken, authMiddleware.verifyAdmin, categoryController.deleteCategory);

export default router;
