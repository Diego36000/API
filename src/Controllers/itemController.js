import itemModel from '../Models/itemModel.js';
import fs from 'node:fs';
import path from 'node:path';

const VALID_STATUSES = new Set(['available', 'reserved', 'sold']);
const VALID_CONDITIONS = new Set(['new', 'like_new', 'good', 'acceptable', 'for_parts']);
const DIMENSIONS_REGEX = /^\d+(\.\d+)?x\d+(\.\d+)?x\d+(\.\d+)?(\s*(cm|mm|m|in|ft))?$/i;

function deleteUploadFile(filePath) {
    if (!filePath) return;
    const abs = path.join(process.cwd(), 'data', filePath);
    fs.unlink(abs, () => {});
}

async function deleteItemFiles(itemId) {
    const urls = await itemModel.getItemPhotos(itemId);
    for (const url of urls) deleteUploadFile(url);
}

async function getAllItems(req, res) {
    const { search, category_id, status, condition, country, page = 1, limit = 24 } = req.query;
    try {
        const { items, total } = await itemModel.getItemsFiltered(
            {
                search: search || null,
                category_id: category_id ? Number(category_id) : null,
                status: status && VALID_STATUSES.has(status) ? status : null,
                condition: condition && VALID_CONDITIONS.has(condition) ? condition : null,
                country: country || null,
            },
            Math.max(1, Number(page)),
            Math.min(100, Math.max(1, Number(limit)))
        );
        res.status(200).json({ data: items, total, page: Number(page), limit: Number(limit) });
    } catch {
        res.status(500).json({ error: 'Error fetching items' });
    }
}

async function getSellerCountries(_req, res) {
    try {
        const countries = await itemModel.getSellerCountries();
        res.status(200).json({ data: countries });
    } catch {
        res.status(500).json({ error: 'Error fetching countries' });
    }
}

async function getItemById(req, res) {
    const { itemId } = req.params;
    try {
        const results = await itemModel.getItemById(itemId);
        if (results.length === 0) return res.status(404).json({ error: 'Item not found' });
        res.status(200).json({ data: results[0] });
    } catch {
        res.status(500).json({ error: 'Error fetching item' });
    }
}

async function getItemsBySeller(req, res) {
    const { sellerId } = req.params;
    try {
        const results = await itemModel.getItemsBySeller(sellerId);
        if (results.length === 0) return res.status(404).json({ error: 'No items found for this seller' });
        res.status(200).json({ data: results });
    } catch {
        res.status(500).json({ error: 'Error fetching seller items' });
    }
}

function validateItemFields({ name, price, dimensions, condition }) {
    if (!name || !price) return 'Missing required fields: name, price';
    if (Number.isNaN(Number(price)) || Number(price) <= 0) return 'Price must be a positive number';
    if (dimensions && !DIMENSIONS_REGEX.test(dimensions)) return 'dimensions must be in format LxWxH (e.g. 30x20x10 cm)';
    if (condition && !VALID_CONDITIONS.has(condition)) return 'condition must be one of: new, like_new, good, acceptable, for_parts';
    return null;
}

async function createItem(req, res) {
    const { name, description, price, weight_grams, dimensions, condition, category_id } = req.body;
    const seller_id = req.userId;

    const validationError = validateItemFields({ name, price, dimensions, condition });
    if (validationError) return res.status(400).json({ error: validationError });

    try {
        const result = await itemModel.createItem({ name, description, price, seller_id, category_id, weight_grams, dimensions, condition });
        res.status(201).json({ message: 'Item created successfully', itemId: result.insertId });
    } catch {
        res.status(500).json({ error: 'Error creating item' });
    }
}

async function updateItem(req, res) {
    const { itemId } = req.params;
    const { name, description, price, weight_grams, dimensions, condition, category_id, status } = req.body;
    const userId = req.userId;

    try {
        const results = await itemModel.getItemById(itemId);
        if (results.length === 0) return res.status(404).json({ error: 'Item not found' });

        const item = results[0];
        if (item.seller_id !== userId && !req.isAdmin) return res.status(403).json({ error: 'You can only update your own items' });

        const validationError = validateItemFields({ name, price, dimensions, condition });
        if (validationError) return res.status(400).json({ error: validationError });

        const finalStatus = status || item.status;
        if (!VALID_STATUSES.has(finalStatus)) {
            return res.status(400).json({ error: 'status must be one of: available, reserved, sold' });
        }

        await itemModel.updateItem(itemId, {
            name, description, price,
            category_id: category_id === undefined ? item.category_id : category_id,
            weight_grams: weight_grams === undefined ? item.weight_grams : weight_grams,
            dimensions: dimensions === undefined ? item.dimensions : dimensions,
            condition: condition === undefined ? item.condition : condition,
            status: finalStatus
        });
        res.status(200).json({ message: 'Item updated successfully' });
    } catch {
        res.status(500).json({ error: 'Error updating item' });
    }
}

async function updateItemStatus(req, res) {
    const { itemId } = req.params;
    const { status } = req.body;
    const userId = req.userId;

    if (!status || !VALID_STATUSES.has(status)) {
        return res.status(400).json({ error: 'status must be one of: available, reserved, sold' });
    }

    try {
        const results = await itemModel.getItemById(itemId);
        if (results.length === 0) return res.status(404).json({ error: 'Item not found' });
        if (results[0].seller_id !== userId && !req.isAdmin) return res.status(403).json({ error: 'You can only update your own items' });

        await itemModel.updateItemStatus(itemId, status);
        res.status(200).json({ message: 'Item status updated', status });
    } catch {
        res.status(500).json({ error: 'Error updating item status' });
    }
}

async function uploadItemPhotos(req, res) {
    const { itemId } = req.params;
    const userId = req.userId;

    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No image files provided' });
    }

    try {
        const results = await itemModel.getItemById(itemId);
        if (results.length === 0) return res.status(404).json({ error: 'Item not found' });

        const item = results[0];
        if (item.seller_id !== userId && !req.isAdmin) return res.status(403).json({ error: 'You can only upload photos to your own items' });

        await deleteItemFiles(itemId);
        await itemModel.deleteItemPhotos(itemId);

        const urls = req.files.map(file => `/uploads/${file.filename}`);
        await itemModel.addItemPhotos(itemId, urls);

        res.status(200).json({ message: 'Item photos uploaded successfully', itemId, photosCount: urls.length });
    } catch {
        res.status(500).json({ error: 'Error uploading item photos' });
    }
}

async function deleteItem(req, res) {
    const { itemId } = req.params;
    const userId = req.userId;

    try {
        const results = await itemModel.getItemById(itemId);
        if (results.length === 0) return res.status(404).json({ error: 'Item not found' });

        const item = results[0];
        if (item.seller_id !== userId && !req.isAdmin) return res.status(403).json({ error: 'You can only delete your own items' });

        await deleteItemFiles(itemId);
        await itemModel.deleteItem(itemId);
        res.status(200).json({ message: 'Item deleted successfully', itemId });
    } catch {
        res.status(500).json({ error: 'Error deleting item' });
    }
}

export default { getAllItems, getSellerCountries, getItemById, getItemsBySeller, createItem, updateItem, updateItemStatus, uploadItemPhotos, deleteItem };
