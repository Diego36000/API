import conversationModel from '../Models/conversationModel.js';
import itemModel from '../Models/itemModel.js';

async function getMyConversations(req, res) {
    try {
        const results = await conversationModel.getConversationsByUser(req.userId);
        res.status(200).json({ data: results });
    } catch {
        res.status(500).json({ error: 'Error fetching conversations' });
    }
}

async function startConversation(req, res) {
    const { item_id } = req.body;
    const buyer_id = req.userId;

    if (!item_id) return res.status(400).json({ error: 'item_id is required' });

    try {
        const items = await itemModel.getItemById(item_id);
        if (items.length === 0) return res.status(404).json({ error: 'Item not found' });

        const seller_id = items[0].seller_id;
        if (!seller_id) return res.status(400).json({ error: 'Item has no seller' });
        if (seller_id === buyer_id) return res.status(400).json({ error: 'You cannot start a conversation with yourself' });

        const conversation = await conversationModel.createConversation(item_id, buyer_id, seller_id);
        res.status(201).json({ message: 'Conversation started', data: conversation });
    } catch {
        res.status(500).json({ error: 'Error starting conversation' });
    }
}

async function getMessages(req, res) {
    const { conversationId } = req.params;
    const userId = req.userId;

    try {
        const convResults = await conversationModel.getConversationById(conversationId);
        if (convResults.length === 0) return res.status(404).json({ error: 'Conversation not found' });

        const conv = convResults[0];
        if (conv.buyer_id !== userId && conv.seller_id !== userId) {
            return res.status(403).json({ error: 'You are not part of this conversation' });
        }

        const messages = await conversationModel.getMessages(conversationId);
        res.status(200).json({ data: messages });
    } catch {
        res.status(500).json({ error: 'Error fetching messages' });
    }
}

async function sendMessage(req, res) {
    const { conversationId } = req.params;
    const { content } = req.body;
    const userId = req.userId;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
        return res.status(400).json({ error: 'Message content is required' });
    }

    try {
        const convResults = await conversationModel.getConversationById(conversationId);
        if (convResults.length === 0) return res.status(404).json({ error: 'Conversation not found' });

        const conv = convResults[0];
        if (conv.buyer_id !== userId && conv.seller_id !== userId) {
            return res.status(403).json({ error: 'You are not part of this conversation' });
        }

        const message = await conversationModel.addMessage(conversationId, userId, content.trim());
        res.status(201).json({ message: 'Message sent', data: message });
    } catch {
        res.status(500).json({ error: 'Error sending message' });
    }
}

export default { getMyConversations, startConversation, getMessages, sendMessage };
