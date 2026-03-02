import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User, UserProgress,Mentor, Module, Lesson } from "../models/index.js";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Cari di tabel User terlebih dahulu
    let account = await User.findOne({ where: { email } });
    let role = 'user';

    // 2. Jika tidak ada di User, cari di tabel Mentor
    if (!account) {
      account = await Mentor.findOne({ where: { email } });
      role = 'mentor';
    }

    if (!account) {
      return res.status(404).json({ message: "Akun tidak ditemukan" });
    }

    // 3. Bandingkan password
    const isPasswordValid = await bcrypt.compare(password, account.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Password salah" });
    }

    // 4. Buat JWT Token (Sertakan role hasil deteksi tadi)
    const token = jwt.sign(
      { id: account.id, role: role }, // Role otomatis terisi 'user' atau 'mentor'
      process.env.JWT_SECRET || "rahasia_negara",
      { expiresIn: "24h" }
    );

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
    res.status(500).json({ message: "Terjadi kesalahan server", error: error.message });
  }
};

export const register = async (req, res) => {
  try {
    const { nama, email, password, confPassword } = req.body; // Gunakan 'nama' sesuai migrasi

    if (password !== confPassword) {
      return res.status(400).json({ message: "Password dan Confirm Password tidak cocok" });
    }

    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: "Email sudah digunakan" });
    }

    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(password, salt);

    await User.create({
      nama: nama, // Sesuai kolom di DB
      email: email,
      password: hashPassword
      // role tidak perlu diisi karena sudah beda tabel
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
      attributes: ['id', 'nama', 'email', 'level_saat_ini'] // [cite: 39, 137]
    });

    if (!user) return res.status(404).json({ msg: "User tidak ditemukan" });

    // Ambil data semua modul yang ada [cite: 129]
    const allModules = await Module.findAll({ attributes: ['id'] });

    // Hitung progres untuk setiap modul secara dinamis
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
      moduleProgress: moduleProgressMap // Contoh: { "1": 100, "2": 9 }
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // 1. Ambil data user
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

    // 2. Ambil modul
    // Kita gunakan logika yang sama dengan getMe (ambil semua modul) 
    // agar tidak muncul pesan "Belum ada modul" jika level_id user null
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

    // 3. Hitung progres tiap modul (Logika Identik dengan getMe)
    for (const mod of allModules) {
      const totalInMod = await Lesson.count({ where: { module_id: mod.id } });
      const completedInMod = await UserProgress.count({
        where: { 
          user_id: userId, 
          module_id: mod.id, 
          status_selesai: true 
        }
      });
      
      const percent = totalInMod > 0 ? Math.round((completedInMod / totalInMod) * 100) : 0;
      
      // Simpan hasil ke map (seperti output getMe)
      moduleProgressMap[mod.id] = percent;

      // LOGIKA UTAMA: Jika progres modul sudah 100, tambahkan ke penghitung modul tuntas
      if (percent === 100) {
        totalCompletedModules++;
      }
    }

    /**
     * 4. Hitung Persentase Level
     * Jika Level 1 dianggap terdiri dari 5 modul, maka:
     * 1 modul tuntas = 20%
     * 2 modul tuntas = 40%
     * dst.
     */
    const totalModulDiLevel = 5; // Anda bisa ganti allModules.length jika ingin dinamis
    const levelPercentage = Math.round((totalCompletedModules / totalModulDiLevel) * 100);

    // 5. Tentukan Modul Aktif (modul pertama yang belum 100%)
    const activeModule = allModules.find(m => moduleProgressMap[m.id] < 100) || allModules[allModules.length - 1];

    // Response Akhir
    res.status(200).json({
      nama: user.nama,
      level_saat_ini: user.level_saat_ini || "Level 1: Dasar Literasi",
      persentase_progres: levelPercentage > 100 ? 100 : levelPercentage, // Bar Besar (0, 20, 40...)
      moduleProgress: moduleProgressMap, // Detail seperti getMe { "1": 100, "2": 9 }
      currentModule: {
        id: activeModule.id,
        title: activeModule.nama_modul,
        progress: moduleProgressMap[activeModule.id] // Progres asli modul (misal 9%)
      },
      message: `Anda telah menyelesaikan ${totalCompletedModules} modul sepenuhnya.`
    });

  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ 
      message: "Terjadi kesalahan server", 
      error: error.message 
    });
  }
};

export const logout = async (req, res) => {
  try {
    /* Jika kamu menggunakan Cookies (HttpOnly), aktifkan baris ini:
       res.clearCookie('token'); 
    */

    return res.status(200).json({ 
      message: "Logout berhasil. Silakan hapus token dari storage Anda." 
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Terjadi kesalahan saat logout", 
      error: error.message 
    });
  }
};

export const updateProgress = async (req, res) => {
  try {
    const { id } = req.user; // Diambil dari middleware verifyToken
    const { increment } = req.body; // Kita kirim berapa persen kenaikannya, misal 5

    // 1. Cari user
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

    // 2. Hitung progres baru (max 100)
    const currentProgress = user.persentase_progres || 0;
    const newProgress = Math.min(currentProgress + increment, 100);

    // 3. Simpan ke database
    await User.update(
      { persentase_progres: newProgress },
      { where: { id: id } }
    );

    res.status(200).json({ 
      message: "Progres berhasil diperbarui", 
      newProgress 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateModuleProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { lessonId, moduleId } = req.body;

    // 1. Simpan materi yang selesai ke tabel User_Progress [cite: 57, 142]
    await UserProgress.findOrCreate({
      where: { 
        user_id: userId, 
        lesson_id: lessonId, 
        module_id: moduleId 
      },
      defaults: { status_selesai: true }
    });

    // 2. Hitung jumlah materi yang sudah selesai di modul ini [cite: 58]
    const completedCount = await UserProgress.count({
      where: { 
        user_id: userId, 
        module_id: moduleId, 
        status_selesai: true 
      }
    });

    // 3. Ambil total materi yang ada untuk modul ini dari tabel Lessons [cite: 115, 116]
    const totalMaterials = await Lesson.count({
      where: { module_id: moduleId }
    });

    // 4. Hitung persentase progres modul tersebut [cite: 60]
    const percentage = totalMaterials > 0 ? Math.round((completedCount / totalMaterials) * 100) : 0;

    // 5. Update persentase_progres di tabel User (sebagai penanda progres terakhir) [cite: 60, 137]
    await User.update(
      { persentase_progres: percentage }, 
      { where: { id: userId } }
    );

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