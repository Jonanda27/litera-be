import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import MentorActivityService from '../services/MentorActivityService.js';
import { User, UserProgress, Mentor, Module, Lesson } from "../models/index.js";
import ActivityLoggerService from '../services/activityLoggerService.js';

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Cari akun di tabel User (untuk Peserta atau Admin)
    let account = await User.findOne({ where: { email } });
    let role;

    if (account) {
      // Ambil role langsung dari kolom 'role' di database ('admin' atau 'peserta')
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

    // 4. Bandingkan password
    const isPasswordValid = await bcrypt.compare(password, account.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Password salah" });
    }

    // 5. Buat JWT Token
    const token = jwt.sign(
      { id: account.id, role: role },
      process.env.JWT_SECRET || "rahasia_negara",
      { expiresIn: "24h" }
    );

    // 6. [LOGIKA LOG TERPISAH]
    if (role === 'mentor') {
      // A. Jika MENTOR: Simpan ke MentorActivityLogs
      await MentorActivityService.log(
        account.id,
        'LOGIN_SESSION',
        `Mentor berhasil login ke sistem menggunakan perangkat ${req.headers['user-agent'] || 'Unknown'}`
      );
    } else {
      // B. Jika PESERTA/ADMIN: Simpan ke ActivityLog umum
      await ActivityLoggerService.logActivity({
        userId: account.id,
        action: 'LOGIN',
        resourceType: 'Auth',
        details: { role: role }
      });
    }

    // 7. Berikan response sukses ke Frontend
    res.status(200).json({
      message: "Login berhasil",
      token,
      user: {
        id: account.id,
        email: account.email,
        role: role 
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
    // 1. Destrukturisasi body (tambahkan no_hp)
    const { nama, email, password, confPassword, mentor_id, no_hp } = req.body;

    // 2. Validasi Password
    if (password !== confPassword) {
      return res.status(400).json({ message: "Password dan Confirm Password tidak cocok" });
    }

    // 3. VALIDASI NO HP (Tambahkan di sini)
    // Mengecek jika no_hp diisi, maka harus berupa angka
    if (no_hp && !/^\d+$/.test(no_hp)) {
      return res.status(400).json({ message: "Nomor HP harus berupa angka saja" });
    }

    // 4. Cek apakah email sudah terdaftar
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: "Email sudah digunakan" });
    }

    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(password, salt);

    // 5. Simpan ke database
    const newUser = await User.create({
      nama: nama,
      email: email,
      password: hashPassword,
      no_hp: no_hp || null, // Masukkan ke kolom database
      mentor_id: mentor_id || null,
      level_saat_ini: 'Level 1: Dasar-Dasar Literasi',
      persentase_progres: 0
    });

    // Logging aktivitas
    await ActivityLoggerService.logActivity({
      userId: newUser.id,
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

    // 1. Cari data user dengan include profil mentor
    const user = await User.findOne({
      where: { id: userId },
      attributes: ['id', 'nama', 'email', 'role'],
      include: [
        {
          model: Mentor,
          as: 'mentor_profile',
          attributes: ['id', 'nama', 'spesialisasi']
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ msg: "User tidak ditemukan" });
    }

    // 2. Logika Penentuan Nama & Role
    let finalRole = user.role;
    let finalName = user.nama;
    if (user.mentor_profile) {
      finalRole = 'Mentor';
      finalName = user.mentor_profile.nama || user.nama;
    }

    // 3. HITUNG PROGRES (PERBAIKAN ERROR ALIAS)
    let moduleProgressMap = {};
    
    if (finalRole !== 'Admin' && finalRole !== 'Mentor') {
      // Ambil semua modul dan sertakan pelajaran (Lesson) menggunakan alias 'lessons'
      const allModules = await Module.findAll({ 
        attributes: ['id'],
        include: [
          {
            model: Lesson,
            as: 'lessons', // <--- INI KUNCINYA: Harus sama dengan di index.js
            attributes: ['id']
          }
        ]
      });

      // Ambil progres user ini
      const userCompletedProgress = await UserProgress.findAll({
        where: { user_id: userId, status_selesai: true },
        attributes: ['module_id', 'lesson_id']
      });

      for (const mod of allModules) {
        // Karena sudah di-include, total lesson diambil dari array lessons
        const totalInMod = mod.lessons ? mod.lessons.length : 0;

        // Filter progres yang selesai di modul ini
        const completedInMod = userCompletedProgress.filter(
          p => p.module_id === mod.id
        ).length;

        moduleProgressMap[mod.id] = totalInMod > 0 
          ? Math.round((completedInMod / totalInMod) * 100) 
          : 0;
      }
    }

    // 4. Kirim respons
    res.status(200).json({
      id: user.id,
      nama: finalName,
      email: user.email,
      role: finalRole, 
      mentorData: user.mentor_profile,
      moduleProgress: moduleProgressMap
    });

  } catch (error) {
    console.error("Error in getMe:", error.message);
    res.status(500).json({ success: false, error: error.message });
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
    // TANGKAP data jawaban dan skor dari body
    const { lessonId, moduleId, jawaban_user, skor } = req.body;

    // Cari data progress yang sudah ada
    let progress = await UserProgress.findOne({
      where: { user_id: userId, lesson_id: lessonId, module_id: moduleId }
    });

    if (progress) {
      // Jika sudah ada, update status, jawaban, dan skor
      await progress.update({ 
        status_selesai: true, 
        jawaban_user: jawaban_user || progress.jawaban_user,
        skor: skor !== undefined ? skor : progress.skor 
      });
    } else {
      // Jika belum ada, buat baru
      progress = await UserProgress.create({
        user_id: userId,
        lesson_id: lessonId,
        module_id: moduleId,
        status_selesai: true,
        jawaban_user: jawaban_user || null,
        skor: skor || 0
      });
    }

    // --- Logic hitung persentase tetap sama seperti kode Anda ---
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

    // Logging aktivitas
    await ActivityLoggerService.logActivity({
      userId: userId,
      action: 'COMPLETE_LESSON',
      resourceType: 'UserProgress',
      details: { 
        moduleId: moduleId, 
        lessonId: lessonId, 
        currentModulePercentage: percentage,
        score: skor // Tambahkan skor di log
      }
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

// Contoh di controllers/mentorController.js
export const getAllMentors = async (req, res) => {
    try {
        // Mengambil data mentor dengan atribut minimal [cite: 1890]
        const mentors = await Mentor.findAll({
            attributes: ['id', 'nama', 'spesialisasi'] 
        });
        
        return res.status(200).json({
            success: true,
            data: mentors
        });
    } catch (error) {
        // Penanganan error jika gagal mengambil data [cite: 107]
        return res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};