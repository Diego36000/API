import express from 'express';
import favoriteController from '../Controllers/favoriteController.js';
import authMiddleware from '../Middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware.verifyToken, favoriteController.getMyFavorites);
router.post('/:itemId', authMiddleware.verifyToken, favoriteController.addFavorite);
router.delete('/:itemId', authMiddleware.verifyToken, favoriteController.removeFavorite);

export default router;
