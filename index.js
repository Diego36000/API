import express from 'express';
import userRoutes from './src/Routes/userRoutes.js';
import itemRoutes from './src/Routes/itemRoutes.js';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const app = express();
const port = 8080;

app.use(bodyParser.json());

app.use('/api/users', userRoutes);
app.use('/api/items', itemRoutes);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});