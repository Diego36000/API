import pg from 'pg';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;

const db = new Pool({
    host: process.env.DATABASE_HOST ?? 'localhost',
    user: process.env.DATABASE_USER ?? 'postgres',
    password: process.env.DATABASE_PASSWORD ?? '',
    database: process.env.DATABASE_NAME ?? 'database',
    port: Number(process.env.DATABASE_PORT ?? 5432)
});

const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
const statements = schema.split(';').map(s => s.trim()).filter(s => s.length > 0);

const client = await db.connect();
try {
    for (const stmt of statements) {
        await client.query(stmt);
    }
    console.log('Database ready');
} finally {
    client.release();
}

export default db;
