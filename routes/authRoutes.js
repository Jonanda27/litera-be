import express from "express";
// Tambahkan .js di akhir jika menggunakan ES Modules (type: module)
import { login } from "../controllers/authController.js"; 

const router = express.Router();

router.post("/login", login);

export default router;