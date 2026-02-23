import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../models/index.js"; // Sesuaikan path ke models kamu

const User = db.User;

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Cari user berdasarkan email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    // 2. Bandingkan password input dengan hashPassword di database
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Password salah" });
    }

    // 3. Buat JWT Token (Sertakan role di dalam payload)
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || "rahasia_negara", // Gunakan .env untuk secret
      { expiresIn: "24h" }
    );

    // 4. Kirim respon sukses
    res.status(200).json({
      message: "Login berhasil",
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan server", error: error.message });
  }
};