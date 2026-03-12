import express from 'express';
import locationController from '../Controllers/locationController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Locations
 *   description: Datos de ubicación
 */

/**
 * @swagger
 * /api/locations/countries:
 *   get:
 *     tags: [Locations]
 *     summary: Obtener lista de países
 *     security: []
 *     responses:
 *       200:
 *         description: Lista de países
 */
router.get('/countries', locationController.getCountries);

export default router;
