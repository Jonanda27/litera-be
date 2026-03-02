import jwt from 'jsonwebtoken';

export const verifyRole = (roles = []) => {
    return (req, res, next) => {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) return res.status(401).json({ message: 'Akses ditolak, token hilang' });

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || "rahasia_negara");
            
            // SIMPAN KE req.user DAN req.userId AGAR SINKRON
            req.user = decoded; 
            req.userId = decoded.id; // Mengambil 'id' dari payload JWT

            if (roles.length && !roles.includes(req.user.role)) {
                return res.status(403).json({ message: 'Anda tidak memiliki akses!' });
            }
            next();
        } catch (err) {
            res.status(401).json({ message: 'Token tidak valid atau kadaluwarsa' });
        }
    };
};

export const verifyToken = verifyRole([]);