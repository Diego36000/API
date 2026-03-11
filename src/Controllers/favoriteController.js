import favoriteModel from '../Models/favoriteModel.js';
import itemModel from '../Models/itemModel.js';

async function getMyFavorites(req, res) {
    try {
        const results = await favoriteModel.getFavoritesByUser(req.userId);
        res.status(200).json({ data: results });
    } catch {
        res.status(500).json({ error: 'Error fetching favorites' });
    }
}

async function addFavorite(req, res) {
    const { itemId } = req.params;
    const userId = req.userId;

    try {
        const items = await itemModel.getItemById(itemId);
        if (items.length === 0) return res.status(404).json({ error: 'Item not found' });

        await favoriteModel.addFavorite(userId, itemId);
        res.status(200).json({ message: 'Item added to favorites' });
    } catch {
        res.status(500).json({ error: 'Error adding favorite' });
    }
}

async function removeFavorite(req, res) {
    const { itemId } = req.params;

    try {
        await favoriteModel.removeFavorite(req.userId, itemId);
        res.status(200).json({ message: 'Item removed from favorites' });
    } catch {
        res.status(500).json({ error: 'Error removing favorite' });
    }
}

export default { getMyFavorites, addFavorite, removeFavorite };
