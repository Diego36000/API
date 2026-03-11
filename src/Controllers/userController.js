import userModel from '../Models/userModel.js';
import jwt from 'jsonwebtoken';
import authMiddleware from '../Middleware/authMiddleware.js';
import fs from 'node:fs';
import path from 'node:path';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function deleteUploadFile(filePath) {
    if (!filePath) return;
    const abs = path.join(process.cwd(), 'data', filePath);
    fs.unlink(abs, () => {});
}

async function login(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    if (!EMAIL_REGEX.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }

    if (typeof password !== 'string' || password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    try {
        const results = await userModel.getUserByEmail(email);

        if (results.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = results[0];
        const isMatch = await authMiddleware.verifyPassword(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.status(200).json({ message: 'Login successful', token, userId: user.id, name: user.name });
    } catch {
        res.status(500).json({ error: 'Error during login' });
    }
}

async function register(req, res) {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
        return res.status(400).json({ error: 'Name must be between 2 and 100 characters' });
    }

    if (!EMAIL_REGEX.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }

    if (typeof password !== 'string' || password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    if (password.length > 72) {
        return res.status(400).json({ error: 'Password must not exceed 72 characters' });
    }

    try {
        const existing = await userModel.getUserByEmail(email);

        if (existing.length > 0) {
            return res.status(409).json({ error: 'User with this email already exists' });
        }

        const result = await userModel.createUser({ name, email, password });
        const token = jwt.sign(
            { id: result.insertId, email },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.status(201).json({ message: 'User registered successfully', token, userId: result.insertId });
    } catch {
        res.status(500).json({ error: 'Error creating user' });
    }
}

async function getAllUsers(_req, res) {
    try {
        const results = await userModel.getAllUsers();
        res.status(200).json({ data: results });
    } catch {
        res.status(500).json({ error: 'Error fetching users' });
    }
}

async function getUserById(req, res) {
    const { userId } = req.params;
    try {
        const results = await userModel.getUserById(userId);
        if (results.length === 0) return res.status(404).json({ error: 'User not found' });
        res.status(200).json({ data: results[0] });
    } catch {
        res.status(500).json({ error: 'Error fetching user' });
    }
}

async function updateUser(req, res) {
    const { userId } = req.params;
    const { name, last_name, username, email, password, phone, bio, country_id, city } = req.body;

    if (!name || !email) {
        return res.status(400).json({ error: 'Name and email are required' });
    }

    try {
        const result = await userModel.updateUserData(userId, { name, last_name, username, email, password, phone, bio, country_id, city });
        if (result.rowCount === 0) return res.status(404).json({ error: 'User not found' });
        res.status(200).json({ message: 'User updated successfully' });
    } catch {
        res.status(500).json({ error: 'Error updating user' });
    }
}

async function uploadProfilePhoto(req, res) {
    const { userId } = req.params;

    if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
    }

    try {
        const results = await userModel.getUserById(userId);
        if (results.length === 0) return res.status(404).json({ error: 'User not found' });

        const oldPhoto = results[0].photo;
        const photoPath = `/uploads/${req.file.filename}`;
        await userModel.updatePhoto(userId, photoPath);

        if (oldPhoto) deleteUploadFile(oldPhoto);

        res.status(200).json({ message: 'Profile photo uploaded successfully', userId });
    } catch {
        res.status(500).json({ error: 'Error uploading profile photo' });
    }
}

async function deleteUser(req, res) {
    const { userId } = req.params;
    const adminId = req.userId;

    try {
        const [requesterResults, targetResults] = await Promise.all([
            userModel.getUserById(adminId),
            userModel.getUserById(userId)
        ]);

        if (requesterResults.length === 0) return res.status(404).json({ error: 'User not found' });
        if (targetResults.length === 0) return res.status(404).json({ error: 'User to delete not found' });

        const isAdmin = requesterResults[0].is_admin === true;
        if (!isAdmin && Number.parseInt(userId) !== Number.parseInt(adminId)) {
            return res.status(403).json({ error: 'You don\'t have permission to delete this user' });
        }

        const photoToDelete = targetResults[0].photo;
        await userModel.deleteUser(userId);
        if (photoToDelete) deleteUploadFile(photoToDelete);

        res.status(200).json({ message: 'User deleted successfully', deletedUserId: userId });
    } catch {
        res.status(500).json({ error: 'Error deleting user' });
    }
}

export default { getAllUsers, getUserById, register, login, updateUser, uploadProfilePhoto, deleteUser };
