import jwt from 'jsonwebtoken';

export const verifyRole = (roles = []) => {
    return (req, res, next) => {
        const authHeader = req.headers.authorization;

        // 1. Validasi keberadaan dan skema Authorization Header
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                status: 'error',
                message: 'Akses ditolak. Format token tidak valid atau token tidak ditemukan.'
            });
        }

        // Ekstraksi token dari string "Bearer <token>"
        const token = authHeader.split(' ')[1];

        try {
            // Evaluasi token secara sinkron.
            // Peringatan Analis: Hardcode "rahasia_negara" harus dihindari di production. 
            // Pastikan environment variables (.env) selalu tersedia di server deployment.
            const secretKey = process.env.JWT_SECRET || "rahasia_negara";
            const decoded = jwt.verify(token, secretKey);

            // 2. Injeksi payload ke request object untuk konsumsi controller
            req.user = decoded;
            req.userId = decoded.id; // Sinkronisasi identifier

            // 3. Validasi Role-Based Access Control (RBAC)
            if (roles.length > 0 && !roles.includes(req.user.role)) {
                // Gunakan 403 Forbidden: Klien dikenali (terautentikasi), 
                // tapi tidak memiliki hak akses (tidak terotorisasi).
                return res.status(403).json({
                    status: 'error',
                    message: 'Akses terlarang. Anda tidak memiliki wewenang untuk sumber daya ini.'
                });
            }

            // Jika lulus semua inspeksi, teruskan ke controller
            next();
        } catch (err) {
            // 4. Penanganan Error Tanpa Stack Trace (Secure Error Handling)
            let errorMessage = 'Token tidak valid atau rusak.';
            let statusCode = 401;

            // Penanganan spesifik jika token sudah lewat masa berlakunya (expired)
            if (err.name === 'TokenExpiredError') {
                errorMessage = 'Sesi Anda telah berakhir. Silakan login kembali.';
            } else if (err.name === 'JsonWebTokenError') {
                errorMessage = 'Struktur token tidak valid.';
            }

            // Logger internal untuk audit server (tidak dikirim ke client)
            // console.error(`[Auth Error] UserID Attempt: Unknown | Reason: ${err.message}`);

            return res.status(statusCode).json({
                status: 'error',
                message: errorMessage
            });
        }
    };
};

// Alias otentikasi universal (Bisa diakses oleh semua role yang valid)
export const verifyToken = verifyRole([]);

// [BARU] Alias otorisasi ketat khusus Admin
export const isAdmin = verifyRole(['admin']);