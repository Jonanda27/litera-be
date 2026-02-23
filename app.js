import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js"; // Import routes baru

const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

// Gunakan Routes
app.use("/api/auth", authRoutes); 

app.get("/", (req, res) => res.send("Backend aktif ✅"));

export default app;