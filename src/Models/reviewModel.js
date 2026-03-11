import db from '../Config/dbConfig.js';

class Review {

    async getReviewsForUser(userId) {
        const { rows } = await db.query(
            `SELECT r.*, u.name as reviewer_name, i.nombre as item_nombre
             FROM reviews r
             JOIN users u ON r.reviewer_id = u.id
             LEFT JOIN items i ON r.item_id = i.id
             WHERE r.reviewed_id = $1
             ORDER BY r.created_at DESC`,
            [userId]
        );
        return rows;
    }

    async getReviewById(id) {
        const { rows } = await db.query('SELECT * FROM reviews WHERE id = $1', [id]);
        return rows;
    }

    async createReview(review) {
        const { rows } = await db.query(
            'INSERT INTO reviews (reviewer_id, reviewed_id, item_id, rating, comment) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [review.reviewer_id, review.reviewed_id, review.item_id || null, review.rating, review.comment || null]
        );
        return rows[0];
    }

    deleteReview(id) {
        return db.query('DELETE FROM reviews WHERE id = $1', [id]);
    }
}

export default new Review();
