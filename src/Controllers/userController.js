import userModel from '../Models/userModel.js';
import jwt from 'jsonwebtoken';
import imageConverter from '../Utils/imageConverter.js';
import authMiddleware from '../Middleware/authMiddleware.js';

function login(req, res) {
    const {email, password} = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    userModel.getUserByEmail(email, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error fetching user' });
        }

        if (results.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = results[0];

        authMiddleware.verifyPassword(password, user.password, (err, isMatch) => {
            if (err) {
                return res.status(500).json({ error: 'Error verifying password' });
            }

            if (!isMatch) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }

            const token = jwt.sign(
                { id: user.id, email: user.email },
                process.env.JWT_SECRET,
                { expiresIn: '8h' }
            );

            res.status(200).json({
                message: 'Login successful',
                token: token,
                userId: user.id,
                name: user.name
            });
        });
    });
}

function register(req, res) {
    const {name, email, password} = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    userModel.getUserByEmail(email, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error checking user' });
        }
        
        if (results.length > 0) {
            return res.status(409).json({ error: 'User with this email already exists' });
        }

        userModel.createUser({name, email, password}, (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Error creating user' });
            }

            const token = jwt.sign(
                { id: results.insertId, email: email },
                process.env.JWT_SECRET,
                { expiresIn: '8h' }
            );

            res.status(201).json({
                message: 'User registered successfully',
                token: token,
                userId: results.insertId
            });
        });
    });
}

function getAllUsers(req, res) {
    userModel.getAllUsers((err, results) => {
        if (err) {  
            res.status(500).json({ error: 'Error fetching users' }); 
            return;
        }
        res.status(200).json({data: results});
    });
}

function getUserById(req, res) {
    const {userId} = req.params;
    userModel.getUserById(userId, (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Error fetching user' });
            return;
        }
        if (results.length === 0) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.status(200).json({data: results[0]});
    });
}

function updateUser(req, res) {
    const {userId} = req.params;
    const {name, email, password} = req.body;
    userModel.updateUserData(userId, {name, email, password}, (err) => {
        if (err) {
            res.status(500).json({ error: 'Error updating user' });
            return;
        }
        res.status(200).json({message: 'User updated successfully'});
    });
}

function uploadProfilePicture(req, res) {
    const {userId} = req.params;

    if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
    }

    userModel.getUserById(userId, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error fetching user' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const base64Image = imageConverter.fileToBase64(req.file);

        userModel.updateProfilePicture(userId, { foto: base64Image }, (err) => {
            if (err) {
                return res.status(500).json({ error: 'Error uploading profile picture' });
            }

            res.status(200).json({
                message: 'Profile picture uploaded successfully',
                userId: userId
            });
        });
    });
}

function deleteUser(req, res) {
    const {userId} = req.params;
    const adminId = req.userId;

    userModel.getUserById(adminId, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error fetching user information' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        userModel.getUserById(userId, (err, userResults) => {
            if (err) {
                return res.status(500).json({ error: 'Error fetching user to delete' });
            }

            if (userResults.length === 0) {
                return res.status(404).json({ error: 'User to delete not found' });
            }

            const requester = results[0];
            const isAdmin = requester.Administrador === 1;

            if (!isAdmin && parseInt(userId) !== parseInt(adminId)) {
                return res.status(403).json({ error: 'You don\'t have permission to delete this user' });
            }

            userModel.deleteUser(userId, (err) => {
                if (err) {
                    return res.status(500).json({ error: 'Error deleting user' });
                }

                res.status(200).json({
                    message: 'User deleted successfully',
                    deletedUserId: userId
                });
            });
        });
    });
}

export default {
    getAllUsers,
    getUserById,
    register,
    login,
    updateUser,
    uploadProfilePicture,
    deleteUser
};

