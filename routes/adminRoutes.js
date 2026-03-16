import express from 'express';
import { getLevelsWithStats, saveLessonContent, createLesson, saveEvaluation, getEvaluationDetails} from '../controllers/adminExerciseContoller.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

const uploadDir = 'public/uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Konfigurasi penyimpanan
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); // Menyimpan di public/uploads
    },
    filename: (req, file, cb) => {
        // Menamai file agar unik: timestamp-namaasli.pdf
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "application/pdf") {
            cb(null, true);
        } else {
            cb(new Error("Hanya file PDF yang diperbolehkan!"), false);
        }
    }
});

/**
 * Menerapkan High Cohesion pada keamanan rute.
 * Penggunaan `router.use()` di tingkat atas memastikan semua endpoint 
 * di bawahnya secara otomatis terproteksi oleh middleware otentikasi & RBAC.
 */
router.use(verifyToken, isAdmin);

// Endpoint RESTful untuk entitas Mentor
router.get("/levels-stats", verifyToken, getLevelsWithStats);
router.post("/save-lesson", verifyToken, isAdmin, upload.single('file'), saveLessonContent);
router.post("/create-lesson", verifyToken, isAdmin, createLesson);
router.post("/save-evaluation", verifyToken, isAdmin, saveEvaluation);
router.get("/evaluation/:lesson_id", verifyToken, isAdmin, getEvaluationDetails);

export default router;