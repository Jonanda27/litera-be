import express from 'express';
import { 
    getLevelsWithStats, 
    saveLessonContent, 
    createLesson, 
    saveEvaluation, 
    getEvaluationDetails,
} from '../controllers/adminExerciseContoller.js'; // Pastikan path file controller benar
import { 
    getAllMentorLogs,
    sendMentorNotification
} from '../controllers/adminDashboardController.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';
import multer from 'multer';
import fs from 'fs';

const router = express.Router();

// --- Konfigurasi Multer (Tetap seperti kode Anda) ---
const uploadDir = 'public/uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
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
 * Middleware Global untuk Router ini
 * Karena ini adalah adminExerciseRouter, kita proteksi semua route di bawahnya.
 */
router.use(verifyToken, isAdmin);
/**
 * @route   GET /api/admin/mentor-logs
 * @desc    Mendapatkan riwayat aktivitas seluruh mentor
 */
router.get("/mentor-logs", getAllMentorLogs);
router.post("/send-notification", verifyToken, isAdmin, sendMentorNotification);


// --- Endpoint Latihan & Konten (Eksisting) ---

router.get("/levels-stats", getLevelsWithStats);
router.post("/save-lesson", upload.single('file'), saveLessonContent);
router.post("/create-lesson", createLesson);
router.post("/save-evaluation", saveEvaluation);
router.get("/evaluation/:lesson_id", getEvaluationDetails);


export default router;