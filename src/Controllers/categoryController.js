import categoryModel from '../Models/categoryModel.js';
import userModel from '../Models/userModel.js';

async function getAllCategories(_req, res) {
    try {
        const results = await categoryModel.getAllCategories();
        res.status(200).json({ data: results });
    } catch {
        res.status(500).json({ error: 'Error fetching categories' });
    }
}

async function createCategory(req, res) {
    const { name } = req.body;
    const userId = req.userId;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({ error: 'Category name is required' });
    }

    try {
        const users = await userModel.getUserById(userId);
        if (users.length === 0 || !users[0].is_admin) {
            return res.status(403).json({ error: 'Only admins can create categories' });
        }

        const category = await categoryModel.createCategory(name.trim());
        res.status(201).json({ message: 'Category created successfully', data: category });
    } catch (err) {
        if (err.code === '23505') return res.status(409).json({ error: 'Category already exists' });
        res.status(500).json({ error: 'Error creating category' });
    }
}

async function deleteCategory(req, res) {
    const { categoryId } = req.params;
    const userId = req.userId;

    try {
        const users = await userModel.getUserById(userId);
        if (users.length === 0 || !users[0].is_admin) {
            return res.status(403).json({ error: 'Only admins can delete categories' });
        }

        await categoryModel.deleteCategory(categoryId);
        res.status(200).json({ message: 'Category deleted successfully' });
    } catch {
        res.status(500).json({ error: 'Error deleting category' });
    }
}

export default { getAllCategories, createCategory, deleteCategory };
