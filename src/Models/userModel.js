import db from '../Config/dbConfig.js';
import bcrypt from 'bcryptjs';

class User {

    getAllUsers(callback) {
        const sql = 'SELECT * FROM users';
        db.query(sql, callback);
    }

    getUserById(id, callback) {
        const sql = 'SELECT * FROM users WHERE id = ?';
        db.query(sql, [id], callback);
    }

    getUserByEmail(email, callback) {
        const sql = 'SELECT * FROM users WHERE email = ?';
        db.query(sql, [email], callback);
    }

    createUser(user, callback) {
        bcrypt.hash(user.password, 10, (err, hashedPassword) => {
            if (err) {
                return callback(err);
            }
            const sql = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
            db.query(sql, [user.name, user.email, hashedPassword], callback);
        });
    }

    updateUserData(id, user, callback) {
        const sql = 'UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?';
        db.query(sql, [user.name, user.email, user.password, id], callback);
    }

    updateProfilePicture(id, user, callback) {
        const sql = 'UPDATE users SET Foto = ? WHERE id = ?';
        db.query(sql, [user.foto, id], callback);
    }

    deleteUser(id, callback) {
        const sql = 'DELETE FROM users WHERE id = ?';
        db.query(sql, [id], callback);
    }
}

export default new User();