import db from '../Config/dbConfig.js';

const BASE_QUERY = `
    SELECT i.*, c.name as category,
        u.name as seller_name, u.photo as seller_photo, u.username as seller_username,
        COALESCE(
            json_agg(json_build_object('id', p.id, 'url', p.url, 'order', p."order") ORDER BY p."order")
            FILTER (WHERE p.id IS NOT NULL), '[]'
        ) as photos
    FROM items i
    LEFT JOIN categories c ON i.category_id = c.id
    LEFT JOIN users u ON u.id = i.seller_id
    LEFT JOIN item_photos p ON p.item_id = i.id
`;

class Item {

    async getAllItems() {
        const { rows } = await db.query(`${BASE_QUERY} GROUP BY i.id, c.name, u.name, u.photo, u.username`);
        return rows;
    }

    async getItemById(id) {
        const { rows } = await db.query(
            `${BASE_QUERY} WHERE i.id = $1 GROUP BY i.id, c.name, u.name, u.photo, u.username`,
            [id]
        );
        return rows;
    }

    async getItemsBySeller(sellerId) {
        const { rows } = await db.query(
            `${BASE_QUERY} WHERE i.seller_id = $1 GROUP BY i.id, c.name, u.name, u.photo, u.username`,
            [sellerId]
        );
        return rows;
    }

    async createItem(item) {
        const { rows } = await db.query(
            'INSERT INTO items (name, description, price, seller_id, category_id, weight_grams, dimensions, condition, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id',
            [item.name, item.description, item.price, item.seller_id, item.category_id || null, item.weight_grams ?? null, item.dimensions || null, item.condition || null, item.status || 'available']
        );
        return { insertId: rows[0].id };
    }

    updateItem(id, item) {
        return db.query(
            'UPDATE items SET name=$1, description=$2, price=$3, category_id=$4, weight_grams=$5, dimensions=$6, condition=$7, status=$8 WHERE id=$9',
            [item.name, item.description, item.price, item.category_id || null, item.weight_grams ?? null, item.dimensions || null, item.condition || null, item.status, id]
        );
    }

    updateItemStatus(id, status) {
        return db.query('UPDATE items SET status = $1 WHERE id = $2', [status, id]);
    }

    async getItemPhotos(itemId) {
        const { rows } = await db.query('SELECT url FROM item_photos WHERE item_id = $1', [itemId]);
        return rows.map(r => r.url);
    }

    async addItemPhotos(itemId, urls) {
        for (let i = 0; i < urls.length; i++) {
            await db.query(
                'INSERT INTO item_photos (item_id, url, "order") VALUES ($1, $2, $3)',
                [itemId, urls[i], i]
            );
        }
    }

    deleteItemPhotos(itemId) {
        return db.query('DELETE FROM item_photos WHERE item_id = $1', [itemId]);
    }

    deleteItem(id) {
        return db.query('DELETE FROM items WHERE id = $1', [id]);
    }
}

export default new Item();
