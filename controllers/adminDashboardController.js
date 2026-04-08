import { User, Mentor, UserProgress, MentorActivityLog } from "../models/index.js";

/**
 * Mendapatkan ringkasan data untuk dashboard admin
 */
export const getDashboardSummary = async (req, res) => {
    try {
        // Mengeksekusi seluruh query agregasi secara paralel untuk efisiensi I/O
        const [
            totalPeserta,
            totalMentor,
            totalAktivitasModulSelesai,
            rataRataProgres
        ] = await Promise.all([
            // 1. Menghitung total entitas User (Peserta)
            User.count(),

            // 2. Menghitung total entitas Mentor
            Mentor.count(),

            // 3. Menghitung total modul yang sudah berstatus selesai di seluruh sistem
            UserProgress.count({
                where: { status_selesai: true }
            }),

            // 4. Mengambil rata-rata progres seluruh user
            User.aggregate('persentase_progres', 'avg')
        ]);

        // Menyusun respons dengan format JSON standar (JSend Format)
        res.status(200).json({
            status: "success",
            message: "Data agregasi dashboard berhasil diambil",
            data: {
                totalPeserta,
                totalMentor,
                totalAktivitasModulSelesai,
                rataRataProgresSistem: rataRataProgres ? Math.round(rataRataProgres) : 0
            }
        });

    } catch (error) {
        console.error("❌ Error Dashboard Summary Aggregation:", error.message);
        res.status(500).json({
            status: "error",
            message: "Terjadi kesalahan internal saat menghitung data metrik sistem."
        });
    }
};

/**
 * Mendapatkan log aktivitas seluruh mentor (untuk Admin)
 */
export const getAllMentorLogs = async (req, res) => {
    try {
        // Mengambil riwayat aktivitas mentor dengan relasi ke Mentor dan User target
        const logs = await MentorActivityLog.findAll({
            include: [
                {
                    model: Mentor,
                    as: 'mentor', // Pastikan alias sesuai dengan definisi di models/index.js
                    attributes: ['id', 'nama', 'email']
                },
                {
                    model: User,
                    as: 'targetUser',
                    attributes: ['id', 'nama']
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: 100 // Membatasi output agar tidak terlalu berat
        });

        return res.status(200).json({
            status: "success",
            message: "Log aktivitas mentor berhasil diambil",
            data: logs
        });
        
    } catch (error) {
        console.error("❌ Error Get All Mentor Logs:", error.message);
        return res.status(500).json({ 
            status: "error", 
            message: "Terjadi kesalahan saat mengambil data log aktivitas.",
            error: error.message 
        });
    }
};

export const sendMentorNotification = async (req, res) => {
    try {
        const { mentorId, action, description } = req.body;

        // Jika mentorId ada, kirim ke individu. Jika null, anggap broadcast ke semua.
        // Di sini kita simpan ke MentorActivityLog agar mentor bisa melihat di dashboard mereka
        const newLog = await MentorActivityLog.create({
            mentor_id: mentorId || null, // null jika untuk semua
            action: action || "SYSTEM_NOTICE",
            description: description,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        res.status(201).json({
            status: "success",
            message: "Notifikasi berhasil dikirim ke mentor.",
            data: newLog
        });
    } catch (error) {
        console.error("❌ Error Send Notification:", error.message);
        res.status(500).json({
            status: "error",
            message: "Gagal mengirim notifikasi."
        });
    }
};