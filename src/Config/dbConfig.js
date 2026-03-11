import mysql from 'mysql2';

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'PROYECTO DAM',
    port: 3306
});

db.getConnection((err, connection) => {
    if (err) { throw err; };
    console.log('Connected to the database');
    if (connection) connection.release();
});

export default db;