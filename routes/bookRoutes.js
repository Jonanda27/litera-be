import express from "express";
import { savePramenulis,saveChapterContent } from "../controllers/bookController.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// Route wajib menggunakan verifyToken agar kita tahu siapa usernya
router.post("/pramenulis", verifyToken, savePramenulis);
router.post("/save-chapter", verifyToken, saveChapterContent);

export default router;