import { Lesson, UserProgress } from '../models/index.js'; 

export const getLessonDetailForUser = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id; 

        const lesson = await Lesson.findByPk(id, {
            attributes: ['id', 'judul_materi', 'url_konten', 'tipe_konten', 'soal_evaluasi'],
            include: [{
                model: UserProgress,
                // PERBAIKAN: Gunakan alias yang sesuai dengan definisi di index.js
                as: 'userProgress', 
                where: { user_id: userId },
                required: false, 
                attributes: ['status_selesai', 'jawaban_user', 'skor']
            }]
        });

        if (!lesson) {
            return res.status(404).json({ success: false, message: "Materi tidak ditemukan" });
        }

        res.json({ success: true, data: lesson });
    } catch (error) {
        console.error("Error in getLessonDetailForUser:", error);
        res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
    }
};

