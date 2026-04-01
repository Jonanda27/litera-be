import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';
import authRoutes from "./routes/authRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import meetingRoutes from "./routes/meetingRoutes.js";
import liveSessionRoutes from "./routes/liveSessionRoutes.js";
import adminDashboardRoutes from "./routes/adminDashboardRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import mentorRoutes from "./routes/mentorRoutes.js";
import adminExerciseRoutes from "./routes/adminRoutes.js";
import ExerciseRoutes from "./routes/exerciseRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";

// [BARU] Import router log aktivitas
import activityLogRoutes from "./routes/activityLogRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// --- PENGATURAN STATIC FILES (DIPERBAIKI) ---
// 1. Pastikan folder uploads tersedia secara fisik saat aplikasi jalan
const uploadDir = path.resolve(__dirname, 'public/uploads/pdf');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// [TAMBAHAN UNTUK FIX ERROR ENOENT] Pastikan folder posters tersedia di public/uploads
const uploadPosterDir = path.resolve(__dirname, 'public/uploads/posters');
if (!fs.existsSync(uploadPosterDir)) {
    fs.mkdirSync(uploadPosterDir, { recursive: true });
}

// [TAMBAHAN UNTUK FIX ERROR ENOENT] Pastikan folder posters tersedia di root project (berdasarkan path error)
const rootPosterDir = path.resolve(__dirname, 'uploads/posters');
if (!fs.existsSync(rootPosterDir)) {
    fs.mkdirSync(rootPosterDir, { recursive: true });
}

// 2. Ekspos folder public/uploads agar bisa diakses via URL /uploads/...
// Contoh: domain.com/uploads/pdf/buku.pdf -> mencari di public/uploads/pdf/buku.pdf
app.use('/uploads', (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // Sesuaikan dengan origin FE
    res.header("Access-Control-Allow-Methods", "GET");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
}, express.static(path.resolve(__dirname, 'public/uploads')));

// 3. Ekspos folder public utama (untuk file statis lainnya)
app.use(express.static(path.resolve(__dirname, 'public')));
// --------------------------------------------

// Update CORS untuk mengizinkan domain produksi kamu di VPS
app.use(cors({ 
    // Izinkan origin frontend Anda
    origin: ["http://localhost:3000", "https://litera.geocitra.com"], 
    credentials: true,
    // Tambahkan header 'Authorization' dan 'Accept' agar diizinkan oleh browser
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Cache-Control'],
    // Penting untuk download file: Ekspos header Content-Disposition
    exposedHeaders: ['Content-Disposition'] 
}));

// Naikkan limit ukuran payload JSON menjadi 50mb
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// --- DAFTAR ROUTES ---
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/meetings", meetingRoutes);
app.use("/api/live-session", liveSessionRoutes);

// Route ini tetap dipertahankan jika ada request yang spesifik ke /api/uploads
app.use('/api/uploads', express.static(path.resolve(__dirname, 'public/uploads')));

app.use("/api/v1/admin/dashboard", adminDashboardRoutes);
app.use("/api/admin/exercise", adminExerciseRoutes);
app.use("/api/users", userRoutes);
app.use("/api/mentors", mentorRoutes);
app.use("/api/activity-logs", activityLogRoutes);
app.use('/api/ai', aiRoutes);
app.use("/api/exercise", ExerciseRoutes);

app.get("/", (req, res) => res.send("Backend aktif ✅"));

export default app;