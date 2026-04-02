import { sequelize, User, Mentor, UserProgress, MentorActivityLog, ChatMessage, LiveSession } from "../models/index.js";

/**
 * Service: Mengambil data agregasi untuk dashboard admin
 */
export const getDashboardSummaryData = async () => {
    try {
        const [
            totalPeserta,
            totalMentor,
            totalAktivitasModulSelesai,
            rataRataProgres
        ] = await Promise.all([
            User.count(),
            Mentor.count(),
            UserProgress.count({
                where: { status_selesai: true }
            }),
            User.aggregate('persentase_progres', 'avg')
        ]);

        return {
            totalPeserta,
            totalMentor,
            totalAktivitasModulSelesai,
            rataRataProgresSistem: rataRataProgres ? Math.round(Number(rataRataProgres)) : 0
        };
    } catch (error) {
        throw new Error(`DashboardSummaryService Error: Gagal mengambil data agregasi. Detail: ${error.message}`);
    }
};

/**
 * Service: Mengambil log aktivitas seluruh mentor (Dengan Pagination)
 */
export const getAllMentorLogsData = async (page = 1, limit = 100) => {
    try {
        const parsedLimit = parseInt(limit, 10);
        const offset = (parseInt(page, 10) - 1) * parsedLimit;

        return await MentorActivityLog.findAndCountAll({
            include: [
                {
                    model: Mentor,
                    as: 'mentor',
                    attributes: ['id', 'nama', 'email']
                },
                {
                    model: User,
                    as: 'targetUser',
                    attributes: ['id', 'nama']
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: parsedLimit,
            offset: offset
        });
    } catch (error) {
        throw new Error(`MentorLogsService Error: Gagal mengambil log aktivitas. Detail: ${error.message}`);
    }
};

/**
 * Service: Membuat notifikasi / log baru untuk mentor
 */
export const createMentorNotificationData = async (mentorId, action, description) => {
    try {
        if (!description) {
            throw new Error("Deskripsi log aktivitas wajib diisi.");
        }

        return await MentorActivityLog.create({
            mentor_id: mentorId || null,
            action: action || "SYSTEM_NOTICE",
            description: description
        });
    } catch (error) {
        throw new Error(`MentorNotificationService Error: Gagal membuat notifikasi. Detail: ${error.message}`);
    }
};

/**
 * Service: Mengambil data untuk Visualisasi Grafik (Charts)
 */
export const getDashboardChartsData = async () => {
    try {
        // 1. Rasio Interaksi Mentoring (Berapa banyak via Teks vs Video)
        const [totalChat, totalVideoCall] = await Promise.all([
            ChatMessage.count(),
            LiveSession.count()
        ]);

        // 2. Tren Pendaftaran Pengguna (Menghitung user baru per bulan)
        // Penyesuaian Dialek PostgreSQL: Menggunakan date_part alih-alih MONTH()
        const userRegistrationTrend = await User.findAll({
            attributes: [
                [sequelize.fn('date_part', 'month', sequelize.col('createdAt')), 'month'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            group: [sequelize.fn('date_part', 'month', sequelize.col('createdAt'))],
            order: [[sequelize.fn('date_part', 'month', sequelize.col('createdAt')), 'ASC']],
            raw: true
        });

        return {
            mentoringRatio: {
                textDiscussion: totalChat,
                faceToFace: totalVideoCall
            },
            registrationTrend: userRegistrationTrend
        };
    } catch (error) {
        throw new Error(`DashboardChartsService Error: Gagal mengambil data grafik. Detail: ${error.message}`);
    }
};