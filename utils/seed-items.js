/**
 * seed-items.js — inserts sample items into the database for testing pagination.
 * Run from the project root: node seed-items.js [count]
 * Default: 120 items. Uses DATABASE_* env vars (or .env file).
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

// ── Data pools ─────────────────────────────────────────────────────────────
const NAMES = [
  'Vintage Leather Jacket', 'Mechanical Keyboard', 'Mountain Bike', 'Acoustic Guitar',
  'Canon DSLR Camera', 'Gaming Monitor', 'Wool Sweater', 'Running Shoes',
  'Espresso Machine', 'Smart Watch', 'Linen Shirt', 'Noise-Cancelling Headphones',
  'Yoga Mat', 'Skateboard', 'Electric Scooter', 'Cookware Set',
  'Bookshelf', 'Desk Lamp', 'Laptop Stand', 'Bluetooth Speaker',
  'Road Bike', 'Tennis Racket', 'Snowboard', 'Surfboard',
  'Vinyl Record Player', 'Bass Guitar', 'Drum Kit', 'Ukulele',
  'Drawing Tablet', 'External SSD', 'Webcam', 'USB Hub',
  'Leather Wallet', 'Sunglasses', 'Wristwatch', 'Silver Necklace',
  'Denim Jacket', 'Silk Scarf', 'Hiking Boots', 'Winter Coat',
  'Coffee Table', 'Dining Chair', 'Floor Lamp', 'Plant Pot',
  'Science Fiction Novel', 'Photography Book', 'Cookbook', 'Language Textbook',
  'Dumbbells Set', 'Resistance Bands', 'Skipping Rope', 'Pull-up Bar',
  'Board Game', 'Puzzle 1000 pcs', 'Action Figure', 'RC Car',
  'Power Drill', 'Circular Saw', 'Wrench Set', 'Toolbox',
  'Dog Leash', 'Cat Tree', 'Aquarium Tank', 'Bird Cage',
  'Lipstick Set', 'Perfume', 'Face Cream', 'Electric Toothbrush',
  'Office Chair', 'Whiteboard', 'File Cabinet', 'Monitor Arm',
  'Tripod', 'Camera Lens', 'Flash Diffuser', 'Camera Bag',
  'Video Game Console', 'Controller', 'Gaming Chair', 'Mousepad XL',
  'Baby Carrier', 'Stroller', 'High Chair', 'Baby Monitor',
];

const DESCRIPTIONS = [
  'In great condition, barely used. Original packaging included.',
  'Selling because I upgraded to a newer model. Works perfectly.',
  'Purchased last year, used a handful of times. No scratches.',
  'Excellent build quality. Some minor wear but fully functional.',
  'Great for beginners and enthusiasts alike. Comes with accessories.',
  'Selling as I no longer have space for it. Priced to sell fast.',
  'Immaculate condition, stored carefully. No issues whatsoever.',
  'Lightly used, still under warranty. Comes with original box.',
  'A true gem — hard to find second-hand in this condition.',
  'Needs minor repair but priced accordingly. Great project piece.',
  null,
];

const CONDITIONS = ['new', 'like_new', 'good', 'acceptable', 'for_parts'];
const STATUSES   = ['available', 'available', 'available', 'reserved', 'sold'];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function rand(min, max, dec = 2) { return +(Math.random() * (max - min) + min).toFixed(dec); }

// ── Main ───────────────────────────────────────────────────────────────────
const COUNT = Number(process.argv[2] ?? 120);

const { rows: users } = await db.query('SELECT id FROM users LIMIT 10');
if (users.length === 0) { console.error('No users found. Create at least one user first.'); process.exit(1); }

const { rows: cats } = await db.query('SELECT id FROM categories');
if (cats.length === 0) { console.error('No categories found.'); process.exit(1); }

console.log(`Seeding ${COUNT} items across ${users.length} user(s) and ${cats.length} categor${cats.length === 1 ? 'y' : 'ies'}...`);

let inserted = 0;
for (let i = 0; i < COUNT; i++) {
  const name        = `${pick(NAMES)} ${i + 1}`;
  const description = pick(DESCRIPTIONS);
  const price       = rand(1, 1500);
  const seller_id   = pick(users).id;
  const category_id = Math.random() > 0.1 ? pick(cats).id : null;
  const condition   = pick(CONDITIONS);
  const status      = pick(STATUSES);
  const weight      = Math.random() > 0.4 ? rand(50, 20000, 0) : null;
  const dim         = Math.random() > 0.5
    ? `${rand(5,60,0)}x${rand(5,40,0)}x${rand(2,30,0)} cm`
    : null;

  await db.query(
    `INSERT INTO items (name, description, price, seller_id, category_id, weight_grams, dimensions, condition, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
    [name, description, price, seller_id, category_id, weight, dim, condition, status]
  );
  inserted++;
}

await db.end();
console.log(`Done — inserted ${inserted} items.`);
