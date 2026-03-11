import reviewModel from '../Models/reviewModel.js';

async function getReviewsForUser(req, res) {
    const { userId } = req.params;
    try {
        const results = await reviewModel.getReviewsForUser(userId);
        res.status(200).json({ data: results });
    } catch {
        res.status(500).json({ error: 'Error fetching reviews' });
    }
}

async function createReview(req, res) {
    const { reviewed_id, item_id, rating, comment } = req.body;
    const reviewer_id = req.userId;

    if (!reviewed_id || !rating) {
        return res.status(400).json({ error: 'reviewed_id and rating are required' });
    }

    const ratingNum = Number(rating);
    if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
        return res.status(400).json({ error: 'Rating must be an integer between 1 and 5' });
    }

    if (Number(reviewed_id) === reviewer_id) {
        return res.status(400).json({ error: 'You cannot review yourself' });
    }

    try {
        const review = await reviewModel.createReview({ reviewer_id, reviewed_id, item_id, rating: ratingNum, comment });
        res.status(201).json({ message: 'Review created successfully', data: review });
    } catch {
        res.status(500).json({ error: 'Error creating review' });
    }
}

async function deleteReview(req, res) {
    const { reviewId } = req.params;
    const userId = req.userId;

    try {
        const results = await reviewModel.getReviewById(reviewId);
        if (results.length === 0) return res.status(404).json({ error: 'Review not found' });
        if (results[0].reviewer_id !== userId) return res.status(403).json({ error: 'You can only delete your own reviews' });

        await reviewModel.deleteReview(reviewId);
        res.status(200).json({ message: 'Review deleted successfully' });
    } catch {
        res.status(500).json({ error: 'Error deleting review' });
    }
}

export default { getReviewsForUser, createReview, deleteReview };
