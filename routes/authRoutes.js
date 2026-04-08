import express from "express";
// Import controller autentikasi
import { 
  login, 
  logout, 
  register, 
  getMe, 
  getDashboardSummary, 
  updateProgress, 
  updateModuleProgress,
  getAllMentors
} from "../controllers/authController.js";

// Import controller sertifikat
import { getMyCertificates } from "../controllers/certificateController.js";

// Import middleware autentikasi
import { verifyToken } from "../middleware/auth.js"; 

const router = express.Router();

/**
 * RUTE PUBLIK (Tanpa Token)
 * Digunakan untuk akses awal sebelum login.
 */
router.post("/login", login);
router.post("/register", register);

// Endpoint untuk mengambil daftar mentor agar tampil di dropdown Register
// Dibuat publik agar calon pendaftar bisa melihat daftar mentor
router.get("/mentors", getAllMentors); 

/**
 * RUTE TERPROTEKSI (Memerlukan Token)
 * Menggunakan middleware verifyToken.
 */
router.get("/me", verifyToken, getMe);
router.get('/dashboard-summary', verifyToken, getDashboardSummary);
router.post("/logout", verifyToken, logout);
router.patch('/update-progress', verifyToken, updateProgress);
router.patch('/update-module-progress', verifyToken, updateModuleProgress);
router.get('/my-certificates', verifyToken, getMyCertificates);

export default router;