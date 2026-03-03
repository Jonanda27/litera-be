import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import bookRoutes from "./routes/bookRoutes.js"; // Asumsi kamu sudah menambahkannya

const app = express();

app.use(cors({ origin: "http://localhost:3000", credentials: true }));

// --- UBAH/TAMBAHKAN BAGIAN INI ---
// Naikkan limit ukuran payload JSON menjadi 50mb (bisa disesuaikan)
app.use(express.json({ limit: "50mb" }));
// Tambahkan juga ini untuk form urlencoded berjaga-jaga
app.use(express.urlencoded({ limit: "50mb", extended: true }));
// ---------------------------------

// Gunakan Routes
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);

app.get("/", (req, res) => res.send("Backend aktif ✅"));

export default app;