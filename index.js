import express from 'express';
import userRoutes from './src/Routes/userRoutes.js';
import itemRoutes from './src/Routes/itemRoutes.js';
import categoryRoutes from './src/Routes/categoryRoutes.js';
import conversationRoutes from './src/Routes/conversationRoutes.js';
import favoriteRoutes from './src/Routes/favoriteRoutes.js';
import reviewRoutes from './src/Routes/reviewRoutes.js';
import locationRoutes from './src/Routes/locationRoutes.js';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const host = process.env.API_HOST;
const port = process.env.API_PORT;

app.use(bodyParser.json());

app.use('/api/users', userRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/locations', locationRoutes);

const frontendPath = path.join(__dirname, 'frontend', 'dist', 'frontend', 'browser');
app.use(express.static(frontendPath));
app.use('/uploads', express.static(path.join(__dirname, 'data', 'uploads')));

app.get('{*splat}', (_req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

app.listen(port, host, () => {
    console.log(`Server running on http://${host}:${port}`);
});