// File: routes/activityLogRoutes.js
import express from 'express';
import ActivityLogController from '../controllers/activityLogController.js';

// Asumsi Anda memiliki middleware untuk autentikasi dan otorisasi.
// Silakan sesuaikan import middleware ini dengan struktur direktori Anda.
// import { verifyToken, isAdmin } from '../middleware/authMiddleware.js'; 

const router = express.Router();

/**
 * Route untuk mengambil activity logs.
 * HARUS dilindungi oleh middleware verifyToken dan role checking (misal: isAdmin).
 * * Penggunaan:
 * GET /api/activity-logs?page=1&limit=20&action=LOGIN&startDate=2023-10-01
 */
router.get('/', /* verifyToken, isAdmin, */ ActivityLogController.getLogs);

export default router;