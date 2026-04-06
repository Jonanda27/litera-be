import express from 'express';
import * as adminDashboardController from '../controllers/adminDashboardController.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Semua rute di bawah ini wajib melewati pengecekan token dan hak akses Admin
router.use(verifyToken, isAdmin);

// ----------------------------------------------------
// ENTITAS: KPI & DASHBOARD SUMMARY
// ----------------------------------------------------
router.get('/summary', adminDashboardController.getDashboardSummary);

// ----------------------------------------------------
// ENTITAS: VISUALISASI DATA (CHARTS)
// ----------------------------------------------------
router.get('/charts', adminDashboardController.getDashboardCharts);

// ----------------------------------------------------
// ENTITAS: MENTOR OVERSIGHT & LOGS
// ----------------------------------------------------
router.get('/mentor-logs', adminDashboardController.getAllMentorLogs);
router.post('/mentor-notification', adminDashboardController.sendMentorNotification);
router.get('/retention', adminDashboardController.getRetentionAnalysis);

export default router;