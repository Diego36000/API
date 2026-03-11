import db from '../Config/dbConfig.js';

class Conversation {

    async getConversationsByUser(userId) {
        const { rows } = await db.query(
            `SELECT c.*, i.nombre as item_nombre,
                buyer.name as buyer_name, seller.name as seller_name
             FROM conversations c
             LEFT JOIN items i ON c.item_id = i.id
             JOIN users buyer ON c.buyer_id = buyer.id
             JOIN users seller ON c.seller_id = seller.id
             WHERE c.buyer_id = $1 OR c.seller_id = $1
             ORDER BY c.id DESC`,
            [userId]
        );
        return rows;
    }

    async getConversationById(id) {
        const { rows } = await db.query(
            `SELECT c.*,
                buyer.name as buyer_name, seller.name as seller_name
             FROM conversations c
             JOIN users buyer ON c.buyer_id = buyer.id
             JOIN users seller ON c.seller_id = seller.id
             WHERE c.id = $1`,
            [id]
        );
        return rows;
    }

    async createConversation(item_id, buyer_id, seller_id) {
        const existing = await db.query(
            'SELECT id FROM conversations WHERE item_id = $1 AND buyer_id = $2 AND seller_id = $3',
            [item_id, buyer_id, seller_id]
        );
        if (existing.rows.length > 0) return existing.rows[0];

        const { rows } = await db.query(
            'INSERT INTO conversations (item_id, buyer_id, seller_id) VALUES ($1, $2, $3) RETURNING id',
            [item_id, buyer_id, seller_id]
        );
        return rows[0];
    }

    async getMessages(conversationId) {
        const { rows } = await db.query(
            `SELECT m.*, u.name as sender_name
             FROM messages m
             JOIN users u ON m.sender_id = u.id
             WHERE m.conversation_id = $1
             ORDER BY m.created_at ASC`,
            [conversationId]
        );
        return rows;
    }

    async addMessage(conversationId, senderId, content) {
        const { rows } = await db.query(
            'INSERT INTO messages (conversation_id, sender_id, content) VALUES ($1, $2, $3) RETURNING *',
            [conversationId, senderId, content]
        );
        return rows[0];
    }
}

export default new Conversation();
