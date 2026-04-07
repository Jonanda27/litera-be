import MentorService from '../services/mentorService.js';
import ActivityLoggerService from '../services/activityLoggerService.js';
import { User, Mentor, Level, Module, Lesson, UserProgress, MentorActivityLog } from "../models/index.js";
import { sendWhatsAppMessage } from '../services/whatsappService.js';
import MentorActivityService from "../services/MentorActivityService.js";


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

        // 1. Ambil referensi semua level beserta modulnya
        const allLevels = await Level.findAll({
            include: [{
                model: Module,
                as: 'Modules', // Pastikan alias ini sesuai dengan definisi di models/index.js
                attributes: ['id', 'nama_modul']
            }],
            order: [['id', 'ASC']]
        });

        // 2. Ambil data siswa (User) yang dibimbing oleh mentor ini
        const students = await User.findAll({
            where: { mentor_id: mentorId },
            attributes: ['id', 'nama', 'email', 'no_hp', 'persentase_progres', 'updatedAt'],
            order: [['nama', 'ASC']]
        });

        // 3. Mapping data detail untuk kalkulasi status inaktif dan progress per modul
        const detailedStudents = await Promise.all(students.map(async (student) => {
            const detailedProgress = [];
            let currentActiveLevelName = ""; // Inisialisasi kosong untuk logika pengunci

            // --- Kalkulasi Waktu Inaktif ---
            const lastUpdate = new Date(student.updatedAt);
            const now = new Date();
            const diffInMs = now.getTime() - lastUpdate.getTime();
            
            const diffInSeconds = Math.floor(diffInMs / 1000);
            const diffInMinutes = Math.floor(diffInSeconds / 60);
            const diffInHours = Math.floor(diffInMinutes / 60);
            const diffInDays = Math.floor(diffInHours / 24);

            let inactivityLabel = "";
            if (diffInDays > 0) {
                inactivityLabel = `${diffInDays} hari ${diffInHours % 24} jam yang lalu`;
            } else if (diffInHours > 0) {
                inactivityLabel = `${diffInHours} jam ${diffInMinutes % 60} menit yang lalu`;
            } else if (diffInMinutes > 0) {
                inactivityLabel = `${diffInMinutes} menit yang lalu`;
            } else {
                inactivityLabel = `${diffInSeconds} detik yang lalu`;
            }

            // --- Kalkulasi Progress Per Level & Modul ---
            for (const level of allLevels) {
                const modulesInLevel = [];
                let isLevelIncomplete = false;

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

                    // Tandai jika ada modul yang belum mencapai 100%
                    if (modPercent < 100) {
                        isLevelIncomplete = true;
                    }

                    modulesInLevel.push({
                        moduleId: mod.id,
                        moduleName: mod.nama_modul,
                        progress: modPercent
                    });
                }

                // LOGIKA PERBAIKAN: Tentukan level aktif hanya jika belum ditemukan sebelumnya
                // Dan level saat ini memiliki setidaknya satu modul yang belum selesai.
                if (!currentActiveLevelName && isLevelIncomplete) {
                    currentActiveLevelName = level.nama_level;
                }

                detailedProgress.push({
                    levelId: level.id,
                    levelName: level.nama_level,
                    modules: modulesInLevel
                });
            }

            // --- Fallback & Final Check untuk Level Aktif ---
            if (!currentActiveLevelName) {
                if (student.persentase_progres === 100) {
                    // Jika progres global 100%, tampilkan nama level terakhir
                    currentActiveLevelName = allLevels[allLevels.length - 1]?.nama_level || "Selesai";
                } else {
                    // Jika belum ada yang dikerjakan sama sekali, tampilkan Level 1
                    currentActiveLevelName = allLevels[0]?.nama_level || "Level 1";
                }
            }

            // Gabungkan data asli DB dengan hasil kalkulasi runtime
            return {
                ...student.toJSON(),
                currentLevelDisplay: currentActiveLevelName,
                detailedProgress,
                inactivityLabel,
                daysInactive: diffInDays,
                secondsInactive: diffInSeconds 
            };
        }));

        return res.status(200).json({
            success: true,
            data: detailedStudents
        });

    } catch (error) {
        console.error("Error in getMyStudents:", error);
        return res.status(500).json({ success: false, error: error.message });
    }
}

    /**
     * Mengirimkan pengingat WhatsApp ke siswa dan mencatat log
     */
    static async sendProgressReminder(req, res) {
        try {
            const { studentId, message, type } = req.body;
            const mentorId = req.user.id;
            
            // 1. Cari data mentor
            const mentor = await Mentor.findByPk(mentorId);
            if (!mentor) return res.status(404).json({ message: "Data mentor tidak ditemukan" });
            
            const mentorName = mentor.nama;

            // 2. Cari data siswa (User)
            const student = await User.findByPk(studentId);
            if (!student) return res.status(404).json({ message: "Siswa tidak ditemukan" });

            const waNumber = student.no_hp; 
            
            if (!waNumber && (type === 'whatsapp' || type === 'both')) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Siswa ini belum mendaftarkan nomor WhatsApp." 
                });
            }

            // 3. Logika Notifikasi Website (Internal App)
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

            // 4. Logika WhatsApp Latar Belakang
            if (type === 'whatsapp' || type === 'both') {
                const textMessage = `*Pesan Bimbingan LITERA*\n\nHalo ${student.nama},\nMentor ${mentorName} mengirimkan pesan untuk Anda:\n\n_"${message}"_\n\nYuk, lanjutkan progres belajarmu di platform!`;

                try {
                    // Kirim WA via Service
                    await sendWhatsAppMessage(waNumber, textMessage);

                    // --- LOG AKTIVITAS KHUSUS MENTOR ---
                    await MentorActivityService.log(
                        mentorId, 
                        'WHATSAPP_REMINDER', 
                        `Mengirim WhatsApp ke ${student.nama}. Pesan: "${message}"`,
                        student.id
                    );

                    console.log(`✅ WA dikirim ke ${waNumber} untuk siswa ${student.nama}`);
                } catch (waError) {
                    return res.status(500).json({ 
                        success: false, 
                        message: "Gagal mengirim WhatsApp. Periksa bot server.",
                        error: waError.message 
                    });
                }
            }

            return res.status(200).json({ success: true, message: "Notifikasi berhasil diproses!" });
        } catch (error) {
            console.error("Error in sendProgressReminder:", error);
            return res.status(500).json({ error: error.message });
        }
    }

    static async getMyMentorLogs(req, res) {
        try {
            // ID User didapat dari token (req.user.id)
            // Karena relasi One-to-One di index.js menggunakan foreignKey 'id',
            // maka userId ini sama dengan mentorId di tabel Mentors.
            const userId = req.user.id; 

            const logs = await MentorActivityLog.findAll({
                where: { 
                    mentor_id: userId 
                },
                include: [
                    {
                        model: User,
                        as: 'targetUser', // Nama alias target user sesuai index.js
                        attributes: ['id', 'nama']
                    }
                ],
                order: [['createdAt', 'DESC']], // Terbaru di atas
                limit: 50 // Batasi agar performa tetap cepat
            });

            return res.status(200).json({
                success: true,
                message: "Notifikasi mentor berhasil diambil.",
                data: logs
            });

        } catch (error) {
            console.error("❌ Error Get My Mentor Logs:", error.message);
            return res.status(500).json({
                success: false,
                message: "Terjadi kesalahan saat mengambil riwayat aktivitas.",
                error: error.message
            });
        }
    }

    

}

export default MentorController;