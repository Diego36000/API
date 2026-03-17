import express from 'express';
import https from 'node:https';
import fs from 'node:fs';
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
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import selfsigned from 'selfsigned';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const host = process.env.API_HOST;
const port = process.env.API_PORT;

const swaggerSpec = swaggerJsdoc({
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API',
            version: '1.0.0',
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [{ bearerAuth: [] }],
    },
    apis: ['./src/Routes/*.js'],
});

app.use(bodyParser.json());

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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

const CERT_KEY_PATH = path.join(__dirname, 'data', 'cert.key');
const CERT_CRT_PATH = path.join(__dirname, 'data', 'cert.crt');

let sslKey, sslCert;
if (fs.existsSync(CERT_KEY_PATH) && fs.existsSync(CERT_CRT_PATH)) {
    sslKey = fs.readFileSync(CERT_KEY_PATH);
    sslCert = fs.readFileSync(CERT_CRT_PATH);
} else {
    const pems = selfsigned.generate([{ name: 'commonName', value: 'localhost' }], { days: 365 });
    fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
    fs.writeFileSync(CERT_KEY_PATH, pems.private);
    fs.writeFileSync(CERT_CRT_PATH, pems.cert);
    sslKey = pems.private;
    sslCert = pems.cert;
}

https.createServer({ key: sslKey, cert: sslCert }, app).listen(port, host, () => {
    console.log(`HTTPS server running on https://${host}:${port}`);
});
