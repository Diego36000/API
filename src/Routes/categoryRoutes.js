import express from 'express';
import categoryController from '../Controllers/categoryController.js';
import authMiddleware from '../Middleware/authMiddleware.js';

const router = express.Router();

router.get('/', categoryController.getAllCategories);
router.post('/', authMiddleware.verifyToken, categoryController.createCategory);
router.delete('/:categoryId', authMiddleware.verifyToken, categoryController.deleteCategory);

export default router;
