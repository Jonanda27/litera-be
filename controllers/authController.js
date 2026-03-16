import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User, UserProgress, Mentor, Module, Lesson } from "../models/index.js";
import ActivityLoggerService from '../services/activityLoggerService.js';

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Cari akun di tabel User (untuk Peserta atau Admin)
    let account = await User.findOne({ where: { email } });
    let role;

    if (account) {
      // PERBAIKAN: Ambil role langsung dari kolom 'role' di database
      // Nilainya bisa 'admin' atau 'peserta' sesuai data di tabel Users
      role = account.role; 
    } else {
      // 2. Jika tidak ada di tabel User, cari di tabel Mentor
      account = await Mentor.findOne({ where: { email } });
      if (account) {
        role = 'mentor';
      }
    }

    // 3. Validasi jika akun benar-benar tidak ditemukan
    if (!account) {
      return res.status(404).json({ message: "Akun tidak ditemukan" });
    }

    // 4. Bandingkan password yang diinput dengan password terenkripsi di database
    const isPasswordValid = await bcrypt.compare(password, account.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Password salah" });
    }

    // 5. Buat JWT Token dengan role yang sudah dinamis
    const token = jwt.sign(
      { id: account.id, role: role },
      process.env.JWT_SECRET || "rahasia_negara",
      { expiresIn: "24h" }
    );

    // 6. [INJEKSI LOG] Catat keberhasilan Login ke Activity Log
    await ActivityLoggerService.logActivity({
      userId: account.id,
      action: 'LOGIN',
      resourceType: 'Auth',
      details: { role: role }
    });

    // 7. Berikan response sukses ke Frontend
    res.status(200).json({
      message: "Login berhasil",
      token,
      user: {
        id: account.id,
        email: account.email,
        role: role // Mengirimkan role 'admin', 'peserta', atau 'mentor'
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Terjadi kesalahan server", 
      error: error.message 
    });
  }
};

export const register = async (req, res) => {
  try {
    const { nama, email, password, confPassword } = req.body;

    if (password !== confPassword) {
      return res.status(400).json({ message: "Password dan Confirm Password tidak cocok" });
    }

    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: "Email sudah digunakan" });
    }

    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(password, salt);

    // Modifikasi Analis: Tampung instance yang dibuat untuk mendapatkan ID-nya
    const newUser = await User.create({
      nama: nama,
      email: email,
      password: hashPassword
    });

    // [INJEKSI LOG] Catat pendaftaran mandiri oleh pengguna
    await ActivityLoggerService.logActivity({
      userId: newUser.id, // Aktornya adalah dirinya sendiri
      action: 'REGISTER_USER',
      resourceType: 'Auth',
      resourceId: newUser.id
    });

    res.status(201).json({ message: "Registrasi Berhasil!" });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan server", error: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findOne({
      where: { id: userId },
      attributes: ['id', 'nama', 'email', 'level_saat_ini']
    });

    if (!user) return res.status(404).json({ msg: "User tidak ditemukan" });

    const allModules = await Module.findAll({ attributes: ['id'] });
    const moduleProgressMap = {};

    for (const mod of allModules) {
      const totalInMod = await Lesson.count({ where: { module_id: mod.id } });
      const completedInMod = await UserProgress.count({
        where: { user_id: userId, module_id: mod.id, status_selesai: true }
      });

      moduleProgressMap[mod.id] = totalInMod > 0
        ? Math.round((completedInMod / totalInMod) * 100)
        : 0;
    }

    res.status(200).json({
      ...user.toJSON(),
      moduleProgress: moduleProgressMap
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

    const allModules = await Module.findAll({
      attributes: ['id', 'nama_modul'],
      order: [['id', 'ASC']]
    });

    if (!allModules || allModules.length === 0) {
      return res.status(200).json({
        persentase_progres: 0,
        message: "Data modul tidak ditemukan di database"
      });
    }

    const moduleProgressMap = {};
    let totalCompletedModules = 0;

    for (const mod of allModules) {
      const totalInMod = await Lesson.count({ where: { module_id: mod.id } });
      const completedInMod = await UserProgress.count({
        where: { user_id: userId, module_id: mod.id, status_selesai: true }
      });

      const percent = totalInMod > 0 ? Math.round((completedInMod / totalInMod) * 100) : 0;
      moduleProgressMap[mod.id] = percent;

      if (percent === 100) {
        totalCompletedModules++;
      }
    }

    const totalModulDiLevel = 5;
    const levelPercentage = Math.round((totalCompletedModules / totalModulDiLevel) * 100);

    const activeModule = allModules.find(m => moduleProgressMap[m.id] < 100) || allModules[allModules.length - 1];

    res.status(200).json({
      nama: user.nama,
      level_saat_ini: user.level_saat_ini || "Level 1: Dasar Literasi",
      persentase_progres: levelPercentage > 100 ? 100 : levelPercentage,
      moduleProgress: moduleProgressMap,
      currentModule: {
        id: activeModule.id,
        title: activeModule.nama_modul,
        progress: moduleProgressMap[activeModule.id]
      },
      message: `Anda telah menyelesaikan ${totalCompletedModules} modul sepenuhnya.`
    });

  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ message: "Terjadi kesalahan server", error: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    /* res.clearCookie('token'); */

    // [INJEKSI LOG] Catat aktivitas logout jika req.user tersedia dari middleware
    if (req.user && req.user.id) {
      await ActivityLoggerService.logActivity({
        userId: req.user.id,
        action: 'LOGOUT',
        resourceType: 'Auth'
      });
    }

    return res.status(200).json({
      message: "Logout berhasil. Silakan hapus token dari storage Anda."
    });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan saat logout", error: error.message });
  }
};

export const updateProgress = async (req, res) => {
  try {
    const { id } = req.user;
    const { increment } = req.body;

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

    const currentProgress = user.persentase_progres || 0;
    const newProgress = Math.min(currentProgress + increment, 100);

    await User.update(
      { persentase_progres: newProgress },
      { where: { id: id } }
    );

    // [INJEKSI LOG] Catat perubahan progres utama
    await ActivityLoggerService.logActivity({
      userId: id,
      action: 'UPDATE_PROGRESS',
      resourceType: 'User',
      resourceId: id,
      details: { oldProgress: currentProgress, newProgress: newProgress }
    });

    res.status(200).json({ message: "Progres berhasil diperbarui", newProgress });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateModuleProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { lessonId, moduleId } = req.body;

    await UserProgress.findOrCreate({
      where: { user_id: userId, lesson_id: lessonId, module_id: moduleId },
      defaults: { status_selesai: true }
    });

    const completedCount = await UserProgress.count({
      where: { user_id: userId, module_id: moduleId, status_selesai: true }
    });

    const totalMaterials = await Lesson.count({
      where: { module_id: moduleId }
    });

    const percentage = totalMaterials > 0 ? Math.round((completedCount / totalMaterials) * 100) : 0;

    await User.update(
      { persentase_progres: percentage },
      { where: { id: userId } }
    );

    // [INJEKSI LOG] Catat penyelesaian materi pembelajaran
    await ActivityLoggerService.logActivity({
      userId: userId,
      action: 'COMPLETE_LESSON',
      resourceType: 'UserProgress',
      details: { moduleId: moduleId, lessonId: lessonId, currentModulePercentage: percentage }
    });

    res.status(200).json({
      success: true,
      newProgress: percentage,
      completedSteps: completedCount,
      totalSteps: totalMaterials,
      moduleId: moduleId
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};