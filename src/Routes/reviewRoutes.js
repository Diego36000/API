import express from 'express';
import reviewController from '../Controllers/reviewController.js';
import authMiddleware from '../Middleware/authMiddleware.js';

const router = express.Router();

router.get('/user/:userId', reviewController.getReviewsForUser);
router.post('/', authMiddleware.verifyToken, reviewController.createReview);
router.delete('/:reviewId', authMiddleware.verifyToken, reviewController.deleteReview);

export default router;
