import db from '../Config/dbConfig.js';
import bcrypt from 'bcryptjs';

class User {

    async getAllUsers() {
        const { rows } = await db.query(`
            SELECT u.id, u.name, u.last_name, u.username, u.email, u.photo, u.phone, u.bio, u.country_id, u.city, u.is_admin, co.name as country_name
            FROM users u
            LEFT JOIN countries co ON co.id = u.country_id
        `);
        return rows;
    }

    async getUserById(id) {
        const { rows } = await db.query(`
            SELECT u.id, u.name, u.last_name, u.username, u.email, u.photo, u.phone, u.bio, u.country_id, u.city, u.is_admin, co.name as country_name
            FROM users u
            LEFT JOIN countries co ON co.id = u.country_id
            WHERE u.id = $1
        `, [id]);
        return rows;
    }

    async getUserByEmail(email) {
        const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        return rows;
    }

    async createUser(user) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        const { rows } = await db.query(
            'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id',
            [user.name, user.email, hashedPassword]
        );
        return { insertId: rows[0].id };
    }

    async updateUserData(id, user) {
        const values = [user.name, user.last_name || null, user.username || null, user.email, user.phone || null, user.bio || null, user.country_id || null, user.city || null];

        if (user.password) {
            const hashed = await bcrypt.hash(user.password, 10);
            return db.query(
                `UPDATE users SET name=$1, last_name=$2, username=$3, email=$4, phone=$5, bio=$6, country_id=$7, city=$8, password=$9 WHERE id=$10`,
                [...values, hashed, id]
            );
        }
        return db.query(
            `UPDATE users SET name=$1, last_name=$2, username=$3, email=$4, phone=$5, bio=$6, country_id=$7, city=$8 WHERE id=$9`,
            [...values, id]
        );
    }

    updatePhoto(id, photo) {
        return db.query('UPDATE users SET photo = $1 WHERE id = $2', [photo, id]);
    }

    deleteUser(id) {
        return db.query('DELETE FROM users WHERE id = $1', [id]);
    }
}

export default new User();
