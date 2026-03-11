import db from '../Config/dbConfig.js';

class Item {

    getAllItems(callback) {
        const sql = 'SELECT * FROM items';
        db.query(sql, callback);
    }

    getItemById(id, callback) {
        const sql = 'SELECT * FROM items WHERE ID = ?';
        db.query(sql, [id], callback);
    }

    getItemsByVendor(vendor, callback) {
        const sql = 'SELECT * FROM items WHERE Vendedor = ?';
        db.query(sql, [vendor], callback);
    }

    createItem(item, callback) {
        const sql = 'INSERT INTO items (Nombre, Descripción, Precio, Vendedor, Categorías, Peso, Dimensiones) VALUES (?, ?, ?, ?, ?, ?)';
        db.query(sql, [
            item.nombre, 
            item.descripcion, 
            item.precio, 
            item.vendedor,
            item.categorias,
            item.peso, 
            item.dimensiones
        ], callback);
    }

    updateItem(id, item, callback) {
        const sql = 'UPDATE items SET Nombre = ?, Descripción = ?, Precio = ?, Vendedor = ?, Categorías = ?, Peso = ?, Dimensiones = ? WHERE ID = ?';
        db.query(sql, [
            item.nombre,
            item.descripcion,
            item.precio,
            item.vendedor,
            item.categorias,
            item.peso,
            item.dimensiones,
            id
        ], callback);
    }

    updateItemPictures(id, fotos, callback) {
        const sql = 'UPDATE items SET Fotos = ? WHERE ID = ?';
        db.query(sql, [fotos, id], callback);
    }

    deleteItem(id, callback) {
        const sql = 'DELETE FROM items WHERE ID = ?';
        db.query(sql, [id], callback);
    }

}

export default new Item();