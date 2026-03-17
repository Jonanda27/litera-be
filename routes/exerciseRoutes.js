// Lokasi: litera-be/routes/exerciseRoutes.js
import express from 'express';
import { getLessonDetailForUser } from '../controllers/exerciseController.js';
import { verifyToken } from '../middleware/auth.js'; // Hanya impor verifyToken

const router = express.Router();

// HAPUS router.use(verifyToken, isAdmin) di sini
// Cukup proteksi rute spesifik dengan verifyToken agar peserta bisa lewat
router.get('/lesson-detail/:id', verifyToken, getLessonDetailForUser);

export default router;