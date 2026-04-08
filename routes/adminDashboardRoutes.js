import express from "express";
import { getDashboardSummary } from "../controllers/adminDashboardController.js";
import { verifyRole } from "../middleware/auth.js"; // Import fungsi yang baru kita perbarui

const router = express.Router();

/**
 * GET /api/v1/admin/dashboard/summary
 * Dilindungi oleh middleware: hanya token dengan role 'Admin' yang lolos.
 */
router.get("/summary", verifyRole(['admin']), getDashboardSummary);

export default router;