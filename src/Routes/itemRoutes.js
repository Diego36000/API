import express from 'express';
import itemController from '../Controllers/itemController.js';
import authMiddleware from '../Middleware/authMiddleware.js';
import upload from '../Middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/', itemController.getAllItems);
router.get('/:itemId', itemController.getItemById);

router.get('/vendor/:vendor', authMiddleware.verifyToken, itemController.getItemsByVendor);
router.post('/', authMiddleware.verifyToken, itemController.createItem);
router.put('/:itemId', authMiddleware.verifyToken, itemController.updateItem);
router.post('/:itemId/upload-picture', authMiddleware.verifyToken, upload.array('fotos'), itemController.uploadItemPictures);
router.delete('/:itemId', authMiddleware.verifyToken, itemController.deleteItem);

export default router;
