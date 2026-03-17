import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import meetingRoutes from "./routes/meetingRoutes.js";
import adminDashboardRoutes from "./routes/adminDashboardRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import mentorRoutes from "./routes/mentorRoutes.js";
import adminExerciseRoutes from "./routes/adminRoutes.js";
import ExerciseRoutes from "./routes/exerciseRoutes.js";

// [BARU] Import router log aktivitas
import activityLogRoutes from "./routes/activityLogRoutes.js";

const app = express();
app.use(express.static('public'));
app.use(cors({ origin: "http://localhost:3000", credentials: true }));

// Naikkan limit ukuran payload JSON menjadi 50mb (bisa disesuaikan)
app.use(express.json({ limit: "50mb" }));
// Tambahkan juga ini untuk form urlencoded berjaga-jaga
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Gunakan Routes
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/meetings", meetingRoutes);

// Daftarkan route khusus admin dashboard
app.use("/api/v1/admin/dashboard", adminDashboardRoutes);
app.use("/api/admin/exercise", adminExerciseRoutes);

// Daftarkan route manajemen entitas (akan diproteksi di level router masing-masing)
app.use("/api/users", userRoutes);
app.use("/api/mentors", mentorRoutes);

// [BARU] Daftarkan route khusus untuk log aktivitas
app.use("/api/activity-logs", activityLogRoutes);

app.use("/api/exercise", ExerciseRoutes);

app.use('/uploads', express.static('public/uploads'));

app.get("/", (req, res) => res.send("Backend aktif ✅"));

export default app;