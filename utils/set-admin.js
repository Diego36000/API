/**
 * set-admin.js — grants or revokes admin for a user by email.
 * Usage:
 *   node set-admin.js <email>          → grant admin
 *   node set-admin.js <email> revoke   → revoke admin
 */

import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;
const db = new Pool({
  host:     process.env.DATABASE_HOST     ?? 'localhost',
  user:     process.env.DATABASE_USER     ?? 'postgres',
  password: process.env.DATABASE_PASSWORD ?? '',
  database: process.env.DATABASE_NAME     ?? 'database',
  port:     Number(process.env.DATABASE_PORT ?? 5432),
});

const email   = process.argv[2];
const revoke  = process.argv[3] === 'revoke';

if (!email) {
  console.error('Usage: node set-admin.js <email> [revoke]');
  process.exit(1);
}

const { rows } = await db.query('SELECT id, name, email, is_admin FROM users WHERE email = $1', [email]);

if (rows.length === 0) {
  console.error(`No user found with email: ${email}`);
  await db.end();
  process.exit(1);
}

const user = rows[0];
const newValue = !revoke;

if (user.is_admin === newValue) {
  console.log(`"${user.name}" already has is_admin = ${newValue}. Nothing to do.`);
  await db.end();
  process.exit(0);
}

await db.query('UPDATE users SET is_admin = $1 WHERE id = $2', [newValue, user.id]);
console.log(`Done — "${user.name}" (${email}) → is_admin = ${newValue}`);

await db.end();
