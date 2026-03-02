import express from "express";
import { login, logout,register,getMe,getDashboardSummary,updateProgress,updateModuleProgress } from "../controllers/authController.js";
import { getMyCertificates } from "../controllers/certificateController.js";
import { verifyToken } from "../middleware/auth.js"; 

const router = express.Router();

router.get("/me", verifyToken, getMe);
router.get('/dashboard-summary', verifyToken, getDashboardSummary);
router.post("/login", login);
router.post("/logout", logout);
router.post("/register", register);
router.patch('/update-progress', verifyToken, updateProgress);
router.patch('/update-module-progress', verifyToken, updateModuleProgress);
router.get('/my-certificates', verifyToken, getMyCertificates);

export default router;