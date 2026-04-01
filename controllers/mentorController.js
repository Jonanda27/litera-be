import MentorService from '../services/mentorService.js';
import ActivityLoggerService from '../services/activityLoggerService.js';
import { User, Mentor, Level, Module, Lesson, UserProgress } from "../models/index.js";
import { sendWhatsAppMessage } from '../services/whatsappService.js';


class MentorController {
    /**
     * Mengambil daftar seluruh mentor
     * @route GET /api/mentors
     */
    static async getAllMentors(req, res) {
        try {
            const mentors = await MentorService.getAllMentors();
            return res.status(200).json({
                success: true,
                message: 'Data mentor berhasil diambil.',
                data: mentors
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan internal server.',
                error: error.message
            });
        }
    }

    /**
     * Mengambil detail mentor spesifik berdasarkan ID
     * @route GET /api/mentors/:id
     */
    static async getMentorById(req, res) {
        try {
            const { id } = req.params;
            const mentor = await MentorService.getMentorById(id);

            return res.status(200).json({
                success: true,
                message: 'Detail mentor berhasil diambil.',
                data: mentor
            });
        } catch (error) {
            if (error.message === 'Mentor tidak ditemukan.') {
                return res.status(404).json({ success: false, message: error.message });
            }
            return res.status(500).json({ success: false, error: error.message });
        }
    }

    /**
     * Mendaftarkan mentor baru
     * @route POST /api/mentors
     */
    static async createMentor(req, res) {
        try {
            const newMentor = await MentorService.createMentor(req.body);

            // [INJEKSI LOG] Pencatatan pendaftaran mentor
            await ActivityLoggerService.logActivity({
                userId: req.user?.id || 'SYSTEM',
                action: 'CREATE',
                resourceType: 'Mentor',
                resourceId: newMentor.id,
                details: { email: newMentor.email }
            });

            return res.status(201).json({
                success: true,
                message: 'Mentor berhasil didaftarkan.',
                data: newMentor
            });
        } catch (error) {
            if (error.message === 'Email sudah terdaftar sebagai Mentor.') {
                return res.status(400).json({ success: false, message: error.message });
            }
            return res.status(500).json({ success: false, error: error.message });
        }
    }

    /**
     * Memperbarui data mentor
     * @route PUT /api/mentors/:id
     */
    static async updateMentor(req, res) {
        try {
            const { id } = req.params;
            const updatedMentor = await MentorService.updateMentor(id, req.body);

            // [INJEKSI LOG] Pencatatan update data mentor
            await ActivityLoggerService.logActivity({
                userId: req.user?.id || 'SYSTEM',
                action: 'UPDATE',
                resourceType: 'Mentor',
                resourceId: id,
                details: { updatedFields: Object.keys(req.body) }
            });

            return res.status(200).json({
                success: true,
                message: 'Data mentor berhasil diperbarui.',
                data: updatedMentor
            });
        } catch (error) {
            if (error.message === 'Mentor tidak ditemukan.') {
                return res.status(404).json({ success: false, message: error.message });
            }
            return res.status(500).json({ success: false, error: error.message });
        }
    }

    /**
     * Menghapus mentor dari sistem
     * @route DELETE /api/mentors/:id
     */
    static async deleteMentor(req, res) {
        try {
            const { id } = req.params;
            const result = await MentorService.deleteMentor(id);

            // [INJEKSI LOG] Pencatatan penghapusan mentor
            await ActivityLoggerService.logActivity({
                userId: req.user?.id || 'SYSTEM',
                action: 'DELETE',
                resourceType: 'Mentor',
                resourceId: id
            });

            return res.status(200).json({
                success: true,
                message: result.message
            });
        } catch (error) {
            if (error.message === 'Mentor tidak ditemukan.') {
                return res.status(404).json({ success: false, message: error.message });
            }
            return res.status(500).json({ success: false, error: error.message });
        }
    }

   static async getMyStudents(req, res) {
    try {
        const mentorId = req.user.id;

        const allLevels = await Level.findAll({
            include: [{
                model: Module,
                attributes: ['id', 'nama_modul']
            }],
            order: [['id', 'ASC']]
        });

        const students = await User.findAll({
            where: { mentor_id: mentorId },
            attributes: ['id', 'nama', 'email', 'persentase_progres', 'updatedAt'],
            order: [['nama', 'ASC']]
        });

        const detailedStudents = await Promise.all(students.map(async (student) => {
            const detailedProgress = [];
            let currentActiveLevelName = "Belum Memulai";

            // Kalkulasi Waktu Inaktif
            const lastUpdate = new Date(student.updatedAt);
            const now = new Date();
            const diffInMs = now.getTime() - lastUpdate.getTime();
            
            // Konversi ke berbagai satuan
            const diffInSeconds = Math.floor(diffInMs / 1000);
            const diffInMinutes = Math.floor(diffInSeconds / 60);
            const diffInHours = Math.floor(diffInMinutes / 60);
            const diffInDays = Math.floor(diffInHours / 24);

            let inactivityLabel = "";
            // Logika Label: Diubah agar menampilkan detik jika di bawah 1 menit (Untuk Testing)
            if (diffInDays > 0) {
                inactivityLabel = `${diffInDays} hari ${diffInHours % 24} jam yang lalu`;
            } else if (diffInHours > 0) {
                inactivityLabel = `${diffInHours} jam ${diffInMinutes % 60} menit yang lalu`;
            } else if (diffInMinutes > 0) {
                inactivityLabel = `${diffInMinutes} menit yang lalu`;
            } else {
                inactivityLabel = `${diffInSeconds} detik yang lalu`;
            }

            for (const level of allLevels) {
                const modulesInLevel = [];
                for (const mod of level.Modules) {
                    const totalLessons = await Lesson.count({ where: { module_id: mod.id } });
                    const completedLessons = await UserProgress.count({
                        where: { 
                            user_id: student.id, 
                            module_id: mod.id, 
                            status_selesai: true 
                        }
                    });

                    const modPercent = totalLessons > 0 
                        ? Math.round((completedLessons / totalLessons) * 100) 
                        : 0;

                    if (modPercent < 100 && currentActiveLevelName === "Belum Memulai") {
                        currentActiveLevelName = level.nama_level;
                    }

                    modulesInLevel.push({
                        moduleId: mod.id,
                        moduleName: mod.nama_modul,
                        progress: modPercent
                    });
                }
                detailedProgress.push({
                    levelId: level.id,
                    levelName: level.nama_level,
                    modules: modulesInLevel
                });
            }

            if (student.persentase_progres === 100) {
                currentActiveLevelName = allLevels[allLevels.length - 1]?.nama_level || "Selesai";
            }

            return {
                ...student.toJSON(),
                currentLevelDisplay: currentActiveLevelName,
                detailedProgress,
                inactivityLabel,
                daysInactive: diffInDays,
                secondsInactive: diffInSeconds // Field baru untuk trigger testing
            };
        }));

        return res.status(200).json({
            success: true,
            data: detailedStudents
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}

   static async sendProgressReminder(req, res) {
        try {
            const { studentId, message, type } = req.body;
            
            // PERBAIKAN: Cari data mentor dari DB karena req.user hanya berisi ID dan Role dari JWT
            const mentor = await Mentor.findByPk(req.user.id);
            if (!mentor) return res.status(404).json({ message: "Data mentor tidak ditemukan" });
            
            const mentorName = mentor.nama; // Sekarang mentorName pasti terdefinisi

            const student = await User.findByPk(studentId);
            if (!student) return res.status(404).json({ message: "Siswa tidak ditemukan" });

            // 1. Logika Notifikasi Website (Simpan ke ActivityLog) [cite: 1881]
            await ActivityLoggerService.logActivity({
                userId: student.id,
                action: 'RECEIVE_REMINDER',
                resourceType: 'Notification',
                details: { 
                    from: mentorName, 
                    message: message,
                    context: "Reminder Exercise" 
                }
            });

            // 2. Logika WhatsApp Latar Belakang (Direct Send) via Puppeteer
            if (type === 'whatsapp' || type === 'both') {
                
                // --- HARDCODE NOMOR UNTUK TESTING ---
                const waNumber = "088905298517"; 
                // ------------------------------------

                // Format Teks yang akan masuk ke WA Peserta
                const textMessage = `*Pesan Bimbingan LITERA*\n\nHalo ${student.nama},\nMentor ${mentorName} mengirimkan pesan untuk Anda:\n\n_"${message}"_\n\nYuk, lanjutkan progres belajarmu di platform!`;

                try {
                    // PANGGIL SERVICE WHATSAPP
                    await sendWhatsAppMessage(waNumber, textMessage);
                    console.log(`✅ WA berhasil dikirim ke ${waNumber} oleh ${mentorName}`);
                } catch (waError) {
                    return res.status(500).json({ 
                        success: false, 
                        message: "Gagal mengirim WhatsApp. Pastikan bot sudah di-scan QR.",
                        error: waError.message 
                    });
                }
            }

            return res.status(200).json({ success: true, message: "Notifikasi berhasil dikirim langsung!" });
        } catch (error) {
            console.error("Error Trigger WA:", error);
            return res.status(500).json({ error: error.message });
        }
    }
}

export default MentorController;