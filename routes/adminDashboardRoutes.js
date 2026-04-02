import express from 'express';
import * as adminDashboardController from '../controllers/adminDashboardController.js';
import { verifyToken, isAdmin } from '../middleware/auth.js'; // PERUBAHAN: auth diganti menjadi verifyToken

const router = express.Router();

// Semua rute di bawah ini wajib melewati pengecekan token (verifyToken) dan hak akses Admin (isAdmin)
router.use(verifyToken, isAdmin); // PERUBAHAN: auth diganti menjadi verifyToken

// ----------------------------------------------------
// ENTITAS: KPI & DASHBOARD SUMMARY
// ----------------------------------------------------
// Endpoint: GET /api/admin/dashboard/summary
router.get('/summary', adminDashboardController.getDashboardSummary);

// ----------------------------------------------------
// ENTITAS: VISUALISASI DATA (CHARTS)
// ----------------------------------------------------
// Endpoint: GET /api/admin/dashboard/charts
router.get('/charts', adminDashboardController.getDashboardCharts);

// ----------------------------------------------------
// ENTITAS: MENTOR OVERSIGHT & LOGS
// ----------------------------------------------------
// Endpoint: GET /api/admin/dashboard/mentor-logs
router.get('/mentor-logs', adminDashboardController.getAllMentorLogs);

// Endpoint: POST /api/admin/dashboard/mentor-notification
router.post('/mentor-notification', adminDashboardController.sendMentorNotification);

export default router;