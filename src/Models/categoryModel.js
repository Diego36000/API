import db from '../Config/dbConfig.js';

class Category {

    async getAllCategories() {
        const { rows } = await db.query('SELECT * FROM categories ORDER BY name');
        return rows;
    }

    async getCategoryById(id) {
        const { rows } = await db.query('SELECT * FROM categories WHERE id = $1', [id]);
        return rows;
    }

    async createCategory(name) {
        const { rows } = await db.query(
            'INSERT INTO categories (name) VALUES ($1) RETURNING *',
            [name]
        );
        return rows[0];
    }

    deleteCategory(id) {
        return db.query('DELETE FROM categories WHERE id = $1', [id]);
    }
}

export default new Category();
