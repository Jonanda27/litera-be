import express from "express";
import { 
  savePramenulis, 
  saveChapterContent, 
  savePengembanganCerita, 
  getChapterContent, 
  getCharacters, 
  getAllBooks, 
  getBookDetail, 
  getPramenulis, 
  getPengembangan, 
  getCommentsByChapter, 
  saveComment,
  deleteComment,
  saveChapterVersion,
  getChapterVersions,
  createBook,
  getWeeklyStats
} from "../controllers/bookController.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// --- 1. ROUTE STATIS (TANPA PARAMETER :) ---
// Letakkan semua route GET statis di sini agar tidak bentrok dengan /:id
router.get('/all', verifyToken, getAllBooks);
router.get('/characters', verifyToken, getCharacters);
router.get("/get-chapter", verifyToken, getChapterContent);
router.get("/get-comments", verifyToken, getCommentsByChapter);
router.get("/get-versions", verifyToken, getChapterVersions);
router.get("/stats/:bookId", verifyToken, getWeeklyStats);

// --- 2. ROUTE POST (TIDAK BENTROK DENGAN GET) ---
router.post("/pramenulis", verifyToken, savePramenulis);
router.post("/save-chapter", verifyToken, saveChapterContent);
router.post("/pengembangan", verifyToken, savePengembanganCerita);
router.post("/save-comment", verifyToken, saveComment);
router.post("/delete-comment", verifyToken, deleteComment);
router.post("/save-chapter-version", verifyToken, saveChapterVersion);
router.post("/", verifyToken, createBook);

// --- 3. ROUTE DENGAN PARAMETER KHUSUS ---
router.get("/pramenulis/:bookId", verifyToken, getPramenulis);
router.get("/pengembangan/:bookId", verifyToken, getPengembangan);

// --- 4. ROUTE DINAMIS UMUM (ID) ---
// WAJIB diletakkan paling bawah karena /:id bisa menerima string apa saja
router.get('/:id', verifyToken, getBookDetail);

export default router;