import itemModel from '../Models/itemModel.js';
import imageConverter from '../Utils/imageConverter.js';

function getAllItems(req, res) {
    itemModel.getAllItems((err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error fetching items' });
        }
        const items = results.map(item => ({
            ...item,
            Categorías: item.Categorías ? item.Categorías.split(', ') : [],
            Fotos: item.Fotos ? JSON.parse(item.Fotos) : []
        }));
        
        res.status(200).json({ data: items });
    });
}

function getItemById(req, res) {
    const { itemId } = req.params;
    
    itemModel.getItemById(itemId, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error fetching item' });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ error: 'Item not found' });
        }
        
        const item = {
            ...results[0],
            Categorías: results[0].Categorías ? results[0].Categorías.split(', ') : [],
            Fotos: results[0].Fotos ? JSON.parse(results[0].Fotos) : []
        };
        
        res.status(200).json({ data: item });
    });
}

function getItemsByVendor(req, res) {
    const { vendor } = req.params;
    
    itemModel.getItemsByVendor(vendor, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error fetching vendor items' });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ error: 'No items found for this vendor' });
        }
        
        const items = results.map(item => ({
            ...item,
            Categorías: item.Categorías ? item.Categorías.split(', ') : [],
            Fotos: item.Fotos ? JSON.parse(item.Fotos) : []
        }));
        
        res.status(200).json({ data: items });
    });
}

function createItem(req, res) {
    const { nombre, descripcion, precio, peso, dimensiones, categorias } = req.body;
    const vendedor = req.userId;
    if (!nombre || !descripcion || !precio || !peso || !dimensiones) {
        return res.status(400).json({ error: 'Missing required fields: nombre, descripcion, precio, peso, dimensiones' });
    }
    
    if (isNaN(precio) || precio <= 0) {
        return res.status(400).json({ error: 'Price must be a positive number' });
    }
    
    itemModel.createItem({
        nombre,
        descripcion,
        precio,
        vendedor,
        categorias: categorias || '',
        peso,
        dimensiones
    }, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error creating item' });
        }
        
        res.status(201).json({
            message: 'Item created successfully',
            itemId: results.insertId
        });
    });
}

function updateItem(req, res) {
    const { itemId } = req.params;
    const { nombre, descripcion, precio, peso, dimensiones, categorias } = req.body;
    const userId = req.userId;
    itemModel.getItemById(itemId, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error fetching item' });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ error: 'Item not found' });
        }
        
        const item = results[0];
        
        if (item.Vendedor !== userId) {
            return res.status(403).json({ error: 'You can only update your own items' });
        }
        
        if (!nombre || !descripcion || !precio || !peso || !dimensiones) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        if (isNaN(precio) || precio <= 0) {
            return res.status(400).json({ error: 'Price must be a positive number' });
        }
        
        itemModel.updateItem(itemId, {
            nombre,
            descripcion,
            precio,
            vendedor: userId,
            categorias: categorias || item.Categorías,
            peso,
            dimensiones
        }, (err) => {
            if (err) {
                return res.status(500).json({ error: 'Error updating item' });
            }
            
            res.status(200).json({ message: 'Item updated successfully' });
        });
    });
}

function uploadItemPictures(req, res) {
    const { itemId } = req.params;
    const userId = req.userId;
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No image files provided' });
    }
    
    itemModel.getItemById(itemId, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error fetching item' });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ error: 'Item not found' });
        }
        
        const item = results[0];
        if (item.Vendedor !== userId) {
            return res.status(403).json({ error: 'You can only upload pictures to your own items' });
        }
        const base64Images = req.files.map(file => imageConverter.fileToBase64(file));
        const photosJSON = JSON.stringify(base64Images);
        itemModel.updateItemPictures(itemId, photosJSON, (err) => {
            if (err) {
                return res.status(500).json({ error: 'Error uploading item pictures' });
            }
            
            res.status(200).json({
                message: 'Item pictures uploaded successfully',
                itemId: itemId,
                photosCount: base64Images.length
            });
        });
    });
}

function deleteItem(req, res) {
    const { itemId } = req.params;
    const userId = req.userId;
    itemModel.getItemById(itemId, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error fetching item' });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ error: 'Item not found' });
        }
        
        const item = results[0];
        if (item.Vendedor !== userId) {
            return res.status(403).json({ error: 'You can only delete your own items' });
        }
        
        itemModel.deleteItem(itemId, (err) => {
            if (err) {
                return res.status(500).json({ error: 'Error deleting item' });
            }
            
            res.status(200).json({
                message: 'Item deleted successfully',
                itemId: itemId
            });
        });
    });
}

export default {
    getAllItems,
    getItemById,
    getItemsByVendor,
    createItem,
    updateItem,
    uploadItemPictures,
    deleteItem
};
