import { Level, Module, Lesson } from "../models/index.js";

export const getLevelsWithStats = async (req, res) => {
  try {
    const levels = await Level.findAll({
      include: [{
        model: Module,
        include: [{
          model: Lesson,
          attributes: ['id', 'judul_materi', 'tipe_konten', 'url_konten'] // Ambil data lengkap materi
        }]
      }],
      order: [['id', 'ASC']]
    });

    const response = levels.map(level => ({
      id: level.id,
      nama_level: level.nama_level,
      modules: level.Modules.map(mod => ({
        id: mod.id,
        nama_modul: mod.nama_modul,
        // Kirim array lessons asli, bukan hanya angka
        lessons: mod.Lessons 
      }))
    }));

    res.status(200).json({ success: true, data: response });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const saveLessonContent = async (req, res) => {
    try {
        const { lesson_id, url_konten, tipe_konten } = req.body;

        const lesson = await Lesson.findByPk(lesson_id);
        if (!lesson) {
            return res.status(404).json({ success: false, message: "Materi tidak ditemukan" });
        }

        let finalUrl = url_konten;

        // Jika ada file yang diupload (untuk kategori PDF/book)
        if (req.file) {
            // Kita simpan path yang bisa diakses publik (misal: /uploads/namafile.pdf)
            finalUrl = `/uploads/${req.file.filename}`;
        }

        // Update database dengan URL baru (baik link youtube atau path file lokal)
        await lesson.update({ 
            url_konten: finalUrl, 
            tipe_konten: tipe_konten 
        });

        res.status(200).json({ 
            success: true, 
            message: `Materi '${lesson.judul_materi}' berhasil diperbarui!`,
            data: lesson 
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
export const createLesson = async (req, res) => {
    try {
        const { module_id, judul_materi, tipe_konten } = req.body;

        if (!module_id || !judul_materi || !tipe_konten) {
            return res.status(400).json({ 
                success: false, 
                message: "Module ID, Judul, dan Tipe wajib diisi." 
            });
        }

        const newLesson = await Lesson.create({
            module_id,
            judul_materi,
            tipe_konten,
            url_konten: "" // Inisialisasi kosong, nanti diisi via menu edit
        });

        res.status(201).json({
            success: true,
            message: "Lesson baru berhasil ditambahkan.",
            data: newLesson
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const saveEvaluation = async (req, res) => {
    try {
        const { lesson_id, questions } = req.body;

        // 1. Validasi Input
        if (!lesson_id || !questions || !Array.isArray(questions)) {
            return res.status(400).json({
                success: false,
                message: "ID Lesson dan daftar pertanyaan wajib disertakan dalam format array."
            });
        }

        // 2. Cari materi berdasarkan ID
        const lesson = await Lesson.findByPk(lesson_id);

        if (!lesson) {
            return res.status(404).json({
                success: false,
                message: "Materi (Lesson) tidak ditemukan."
            });
        }

        // 3. Update kolom soal_evaluasi (Kolom JSONB)
        // Objek questions dari FE biasanya berisi: { text, options: [{id, text}], correctAnswer }
        await lesson.update({
            soal_evaluasi: questions
        });

        return res.status(200).json({
            success: true,
            message: "Soal evaluasi berhasil disimpan dan dipublikasikan.",
            data: lesson.soal_evaluasi
        });

    } catch (error) {
        console.error("Error saving evaluation:", error);
        return res.status(500).json({
            success: false,
            message: "Terjadi kesalahan pada server saat menyimpan evaluasi.",
            error: error.message
        });
    }
};

export const getEvaluationDetails = async (req, res) => {
    try {
        const { lesson_id } = req.params;

        const lesson = await Lesson.findByPk(lesson_id, {
            attributes: ['id', 'judul_materi', 'soal_evaluasi']
        });

        if (!lesson) {
            return res.status(404).json({
                success: false,
                message: "Materi tidak ditemukan."
            });
        }

        res.status(200).json({
            success: true,
            data: {
                id: lesson.id,
                title: lesson.judul_materi,
                questions: lesson.soal_evaluasi || [] // Mengembalikan array soal
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Gagal mengambil data evaluasi.",
            error: error.message
        });
    }
};