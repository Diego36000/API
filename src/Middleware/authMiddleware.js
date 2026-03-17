import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

function verifyToken(req, res, next) {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).json({ error: 'No token provided' });
    }

    const tokenWithoutBearer = token.startsWith('Bearer ') ? token.slice(7) : token;

    jwt.verify(tokenWithoutBearer, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }
        req.userId = decoded.id;
        req.isAdmin = decoded.is_admin === true;
        next();
    });
}

function verifyAdmin(req, res, next) {
    if (!req.isAdmin) {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
}

function verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
}

export default { verifyToken, verifyAdmin, verifyPassword };
