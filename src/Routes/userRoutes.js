import express from 'express';
import userController from '../Controllers/userController.js';
import authMiddleware from '../Middleware/authMiddleware.js';
import upload from '../Middleware/uploadMiddleware.js';
const router = express.Router();

router.post('/register', userController.register);
router.post('/login', userController.login);

router.get('/', authMiddleware.verifyToken, userController.getAllUsers);
router.get('/:userId', authMiddleware.verifyToken, userController.getUserById);
router.put('/:userId', authMiddleware.verifyToken, userController.updateUser);
router.post('/:userId/upload-picture', authMiddleware.verifyToken, upload.single('foto'), userController.uploadProfilePicture);
router.delete('/:userId', authMiddleware.verifyToken, userController.deleteUser);

export default router;
