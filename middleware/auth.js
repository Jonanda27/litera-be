const jwt = require('jsonwebtoken');

const verifyRole = (roles = []) => {
    return (req, res, next) => {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) return res.status(401).json({ message: 'Akses ditolak' });

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;

            if (roles.length && !roles.includes(req.user.role)) {
                return res.status(403).json({ message: 'Anda tidak memiliki akses!' });
            }
            next();
        } catch (err) {
            res.status(401).json({ message: 'Token tidak valid' });
        }
    };
};

module.exports = { verifyRole };