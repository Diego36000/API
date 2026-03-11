import db from '../Config/dbConfig.js';

class Favorite {

    async getFavoritesByUser(userId) {
        const { rows } = await db.query(
            `SELECT i.*, c.name as category,
                COALESCE(
                    json_agg(json_build_object('id', p.id, 'url', p.url, 'order', p."order") ORDER BY p."order")
                    FILTER (WHERE p.id IS NOT NULL), '[]'
                ) as photos
             FROM favorites f
             JOIN items i ON f.item_id = i.id
             LEFT JOIN categories c ON i.category_id = c.id
             LEFT JOIN item_photos p ON p.item_id = i.id
             WHERE f.user_id = $1
             GROUP BY i.id, c.name`,
            [userId]
        );
        return rows;
    }

    addFavorite(userId, itemId) {
        return db.query(
            'INSERT INTO favorites (user_id, item_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [userId, itemId]
        );
    }

    removeFavorite(userId, itemId) {
        return db.query(
            'DELETE FROM favorites WHERE user_id = $1 AND item_id = $2',
            [userId, itemId]
        );
    }
}

export default new Favorite();
