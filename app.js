import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import meetingRoutes from "./routes/meetingRoutes.js";
import adminDashboardRoutes from "./routes/adminDashboardRoutes.js"; // [BARU] Import router dashboard admin

const app = express();

app.use(cors({ origin: "http://localhost:3000", credentials: true }));

// Naikkan limit ukuran payload JSON menjadi 50mb (bisa disesuaikan)
app.use(express.json({ limit: "50mb" }));
// Tambahkan juga ini untuk form urlencoded berjaga-jaga
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Gunakan Routes
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/meetings", meetingRoutes);

// [BARU] Daftarkan route khusus admin dashboard
app.use("/api/v1/admin/dashboard", adminDashboardRoutes);

app.get("/", (req, res) => res.send("Backend aktif ✅"));

export default app;