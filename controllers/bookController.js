import { sequelize, Book, QuickIdea, MoodBoard, Research, Outline, Chapter, Character, Setting, Timeline, Plot, ReviewComment, ChapterVersion, DailyWordCount, ChatMessage, User, Discussion } from "../models/index.js";
import { Op } from "sequelize";

// 1. GET WEEKLY STATS & TOTAL PAGES
export const getWeeklyStats = async (req, res) => {
    try {
        const { bookId } = req.params;
        const sevenDaysAgo = new Date(new Date() - 7 * 24 * 60 * 60 * 1000);

        // A. Ambil statistik kata harian (DailyWordCount) - Tetap harian
        const wordStats = await DailyWordCount.findAll({
            where: {
                bookId,
                date: { [Op.gte]: sevenDaysAgo }
            },
            order: [['date', 'ASC']]
        });

        // B. Hitung jumlah halaman yang dibuat SEBELUM 7 hari yang lalu
        // Ini adalah modal awal untuk perhitungan kumulatif
        const basePageCount = await Chapter.count({
            where: {
                bookId,
                createdAt: { [Op.lt]: sevenDaysAgo }
            }
        });

        // C. Ambil jumlah halaman (Chapter) baru per hari
        const dailyPageStats = await Chapter.findAll({
            attributes: [
                [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'new_pages']
            ],
            where: {
                bookId,
                createdAt: { [Op.gte]: sevenDaysAgo }
            },
            group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
            order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']]
        });

        // D. Hitung total keseluruhan halaman untuk badge
        const totalPages = await Chapter.count({
            where: { bookId }
        });

        res.status(200).json({ 
            data: wordStats,
            pageData: dailyPageStats,
            basePageCount: basePageCount, // Kirimkan jumlah awal
            totalPages: totalPages 
        });
    } catch (error) {
        res.status(500).json({ message: "Gagal mengambil statistik", error: error.message });
    }
};

// 2. CREATE BOOK
export const createBook = async (req, res) => {
    try {
        const userId = req.user.id;
        // Tangkap category dari body
        const { title, category } = req.body; 

        if (!title) return res.status(400).json({ message: "Judul buku wajib diisi" });
        if (!category) return res.status(400).json({ message: "Kategori buku wajib dipilih" });

        // Simpan ke database
        const newBook = await Book.create({ 
            title, 
            category, 
            userId 
        });

        res.status(201).json({
            message: "Buku berhasil dibuat",
            data: { 
                bookId: newBook.id, 
                title: newBook.title,
                category: newBook.category // Kembalikan data category di response
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Gagal membuat buku", error: error.message });
    }
};

export const saveChapterContent = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        // Tambahkan outlineId di body
        const { bookId, outlineId, pages, dailyTarget } = req.body;

        if (!bookId || !outlineId || !pages || !Array.isArray(pages)) {
            return res.status(400).json({ message: "Data tidak lengkap" });
        }

        let totalWordCount = 0;
        const incomingPageNumbers = [];

        for (const p of pages) {
            const words = p.content ? p.content.trim().split(/\s+/).filter(w => w !== "").length : 0;
            totalWordCount += words;
            incomingPageNumbers.push(p.page);

            // Cari berdasarkan bookId, outlineId, DAN nomor halaman
            const existingChapter = await Chapter.findOne({
                where: { bookId, outlineId, page: p.page },
                transaction: t
            });

            if (existingChapter) {
                await existingChapter.update({
                    content: p.content || "",
                    word_count: words,
                    daily_target: dailyTarget || 1000
                }, { transaction: t });
            } else {
                await Chapter.create({
                    bookId,
                    outlineId, // Simpan referensi ke bab outline
                    title: "Konten Bab", 
                    content: p.content || "",
                    page: p.page,
                    word_count: words,
                    daily_target: dailyTarget || 1000
                }, { transaction: t });
            }
        }

        // Hapus halaman yang tidak ada lagi di frontend untuk bab ini
        await Chapter.destroy({
            where: {
                bookId,
                outlineId,
                page: { [Op.notIn]: incomingPageNumbers }
            },
            transaction: t
        });

        // Update total kata harian (Opsional: global per buku)
        const today = new Date().toISOString().split('T')[0];
        const [record, created] = await DailyWordCount.findOrCreate({
            where: { bookId, date: today },
            defaults: { word_count: totalWordCount },
            transaction: t
        });
        if (!created) await record.update({ word_count: totalWordCount }, { transaction: t });

        await t.commit();
        return res.status(200).json({ message: "Progres bab berhasil disimpan!" });
    } catch (error) {
        await t.rollback();
        res.status(500).json({ message: "Gagal simpan", error: error.message });
    }
};

export const getChapterContent = async (req, res) => {
    try {
        const { bookId, outlineId } = req.query; // Ambil konten berdasarkan outlineId
        if (!bookId || !outlineId) return res.status(400).json({ message: "ID wajib ada" });

        const chapters = await Chapter.findAll({
            where: { bookId, outlineId },
            order: [['page', 'ASC']]
        });

        return res.status(200).json({
            data: chapters.map(c => ({
                id: c.id,
                page: c.page,
                content: c.content,
                wordCount: c.word_count
            }))
        });
    } catch (error) {
        res.status(500).json({ message: "Error", error: error.message });
    }
};

// 5. SAVE CHAPTER VERSION
export const saveChapterVersion = async (req, res) => {
    try {
        const { chapterId } = req.body;
        if (!chapterId) return res.status(400).json({ message: "chapterId wajib disertakan" });

        const chapter = await Chapter.findOne({
            where: { id: chapterId },
            include: [{ model: Book }]
        });

        if (!chapter) return res.status(404).json({ message: "Draf bab tidak ditemukan" });

        const existingVersionsCount = await ChapterVersion.count({ where: { chapterId } });
        const safeBookTitle = chapter.Book?.title?.replace(/\s+/g, '_').toLowerCase() || 'buku';
        const versionName = `${safeBookTitle}_v${existingVersionsCount + 1}`;

        const newVersion = await ChapterVersion.create({
            chapterId: chapter.id,
            version_name: versionName,
            content: chapter.content,
            word_count: chapter.word_count || 0
        });

        return res.status(201).json({ message: `Berhasil menyimpan versi ${versionName}`, data: newVersion });
    } catch (error) {
        res.status(500).json({ message: "Gagal menyimpan versi", error: error.message });
    }
};

// 6. GET CHAPTER VERSIONS
export const getChapterVersions = async (req, res) => {
    try {
        const { chapterId } = req.query;
        if (!chapterId) return res.status(400).json({ message: "chapterId wajib disertakan" });

        const versions = await ChapterVersion.findAll({
            where: { chapterId },
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json({ data: versions });
    } catch (error) {
        res.status(500).json({ message: "Gagal mengambil riwayat versi", error: error.message });
    }
};

// 7. SAVE COMMENT
export const saveComment = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { chapterId, highlight_id, selected_text, comment_text, label, currentContent } = req.body;
        if (!chapterId || !highlight_id) return res.status(400).json({ message: "Data tidak lengkap" });

        const newComment = await ReviewComment.create({
            chapterId, highlight_id, selected_text, comment_text, label, status: 'open'
        }, { transaction: t });

        await Chapter.update({ content: currentContent }, { where: { id: chapterId }, transaction: t });

        await t.commit();
        res.status(201).json({ message: "Komentar berhasil disimpan", data: newComment });
    } catch (error) {
        await t.rollback();
        res.status(500).json({ message: "Gagal menyimpan komentar", error: error.message });
    }
};

// 8. GET COMMENTS BY CHAPTER
export const getCommentsByChapter = async (req, res) => {
    try {
        const { chapterId } = req.query;
        const comments = await ReviewComment.findAll({
            where: { chapterId },
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json({ data: comments });
    } catch (error) {
        res.status(500).json({ message: "Gagal mengambil komentar", error: error.message });
    }
};

// 9. DELETE COMMENT
export const deleteComment = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { commentId, chapterId, highlight_id, currentContent } = req.body;
        await ReviewComment.destroy({ where: { id: commentId, chapterId }, transaction: t });

        const highlightRegex = new RegExp(`<span id="${highlight_id}"[^>]*>(.*?)<\/span>`, 'g');
        const cleanedContent = currentContent.replace(highlightRegex, '$1');

        await Chapter.update({ content: cleanedContent }, { where: { id: chapterId }, transaction: t });

        await t.commit();
        res.status(200).json({ message: "Komentar dihapus", cleanedContent });
    } catch (error) {
        await t.rollback();
        res.status(500).json({ message: "Gagal menghapus komentar", error: error.message });
    }
};

// 10. SAVE PRAMENULIS
export const savePramenulis = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const userId = req.user.id;
        const { bookId, title, ideCepat, moodBoards, researches, outlines } = req.body;
        let targetBookId = bookId;

        if (targetBookId) {
            const existingBook = await Book.findOne({ where: { id: targetBookId, userId } });
            if (!existingBook) throw new Error("Buku tidak ditemukan");
            await existingBook.update({ title: title || "Tanpa Judul" }, { transaction: t });
        } else {
            const newBook = await Book.create({ title: title || "Tanpa Judul", userId }, { transaction: t });
            targetBookId = newBook.id;
        }

        if (ideCepat?.title) {
            const existingIdea = await QuickIdea.findOne({ where: { bookId: targetBookId } });
            const ideaData = { title: ideCepat.title, description: ideCepat.description, category_tag: ideCepat.tag, date: ideCepat.date || new Date() };
            if (existingIdea) await existingIdea.update(ideaData, { transaction: t });
            else await QuickIdea.create({ bookId: targetBookId, ...ideaData }, { transaction: t });
        }

        if (moodBoards) await MoodBoard.destroy({ where: { bookId: targetBookId }, transaction: t });
        if (researches) await Research.destroy({ where: { bookId: targetBookId }, transaction: t });
        if (outlines) await Outline.destroy({ where: { bookId: targetBookId }, transaction: t });

        if (moodBoards?.length) await MoodBoard.bulkCreate(moodBoards.map(m => ({ bookId: targetBookId, image_url: m.image_url, category: m.category })), { transaction: t });
        if (researches?.length) await Research.bulkCreate(researches.map(r => ({ bookId: targetBookId, source_title: r.source_title, link_url: r.link_url, notes: r.notes })), { transaction: t });
        if (outlines?.length) await Outline.bulkCreate(outlines.map((o, i) => ({ bookId: targetBookId, chapter_number: i + 1, title: o.title, summary: `${o.sub1 || ''}\n${o.sub2 || ''}`.trim(), order_index: i })), { transaction: t });

        await t.commit();
        res.status(200).json({ message: "Pramenulis disimpan", bookId: targetBookId });
    } catch (error) {
        await t.rollback();
        res.status(500).json({ message: "Gagal simpan pramenulis", error: error.message });
    }
};

// 11. GET PRAMENULIS
export const getPramenulis = async (req, res) => {
    try {
        const userId = req.user.id;
        const { bookId } = req.params;

        const book = await Book.findOne({
            where: { id: bookId, userId },
            include: [
                { model: QuickIdea },
                { model: MoodBoard },
                { model: Research },
                { model: Outline }
            ],
            // Order diletakkan di sini untuk mengurutkan hasil include
            order: [
                [Outline, 'order_index', 'ASC']
            ]
        });

        if (!book) return res.status(404).json({ message: "Proyek tidak ditemukan" });
        
        const plain = book.toJSON();

        res.status(200).json({
            data: {
                bookId: plain.id,
                title: plain.title,
                ideCepat: plain.QuickIdea ? {
                    title: plain.QuickIdea.title,
                    description: plain.QuickIdea.description,
                    tag: plain.QuickIdea.category_tag,
                    date: plain.QuickIdea.date
                } : null,
                // Pastikan penamaan plural sesuai dengan yang dihasilkan Sequelize
                moodBoards: plain.MoodBoards || plain.MoodBoard || [],
                researches: plain.Researches || plain.Researchs || plain.Research || [],
                outlines: (plain.Outlines || plain.Outline || []).map(o => {
                    const parts = o.summary ? o.summary.split('\n') : ['', ''];
                    return { 
                        id: o.id, 
                        title: o.title, 
                        sub1: parts[0] || '', 
                        sub2: parts[1] || '' 
                    };
                })
            }
        });
    } catch (error) {
        console.error("Error getPramenulis:", error);
        res.status(500).json({ message: "Error fetch pramenulis", error: error.message });
    }
};

export const getAllBooks = async (req, res) => {
    try {
        const userId = req.user.id; 
        const books = await Book.findAll({ 
            where: { userId }, 
            order: [['updatedAt', 'DESC']], 
            include: [{ model: QuickIdea, required: false }] // Ini yang memicu error jika DB tidak sinkron [cite: 180]
        });
        res.status(200).json({ data: books }); 
    } catch (error) {
        res.status(500).json({ message: "Gagal ambil daftar buku", error: error.message }); 
    }
};

// 13. SAVE PENGEMBANGAN CERITA
export const savePengembanganCerita = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const userId = req.user.id;
        const { bookId, karakter, worldBuilding, timeline, plotItems, plotColumns } = req.body;

        const existingBook = await Book.findOne({ where: { id: bookId, userId } });
        if (!existingBook) return res.status(404).json({ message: "Akses ditolak" });

        await Character.destroy({ where: { bookId }, transaction: t });
        if (karakter?.length) await Character.bulkCreate(karakter.map(c => ({ bookId, name: c.nama, age: c.umur, physical_desc: c.fisik, personality_backstory: `${c.kepribadian || ''}\n${c.latarBelakang || ''}`.trim(), image_url: c.image })), { transaction: t });

        await Setting.destroy({ where: { bookId }, transaction: t });
        if (worldBuilding) await Setting.create({ bookId, location_name: worldBuilding.lokasi, description_ambiance: worldBuilding.deskripsi, history_relation: worldBuilding.sejarah, resident_characters: worldBuilding.karakterPenghuni }, { transaction: t });

        await Timeline.destroy({ where: { bookId }, transaction: t });
        if (timeline?.length) await Timeline.bulkCreate(timeline.map(tm => ({ bookId, time_date: tm.waktu, event: tm.kejadian, involved_characters: tm.karakter })), { transaction: t });

        await Plot.destroy({ where: { bookId }, transaction: t });
        if (plotItems?.length) await Plot.bulkCreate(plotItems.map((item, i) => ({ bookId, act: plotColumns.find(col => col.id === item.babak)?.title || "Babak", tag: item.type, title: item.label, description: item.desc, order_index: i })), { transaction: t });

        await t.commit();
        res.status(200).json({ message: "Pengembangan disimpan" });
    } catch (error) {
        await t.rollback();
        res.status(500).json({ message: "Error simpan pengembangan", error: error.message });
    }
};

// 14. GET PENGEMBANGAN
export const getPengembangan = async (req, res) => {
    try {
        const userId = req.user.id;
        const { bookId } = req.params;
        const book = await Book.findOne({
            where: { id: bookId, userId },
            include: [{ model: Character }, { model: Setting }, { model: Timeline }, { model: Plot }]
        });
        if (!book) return res.status(404).json({ message: "Buku tidak ditemukan" });
        res.status(200).json({ data: book });
    } catch (error) {
        res.status(500).json({ message: "Error fetch pengembangan", error: error.message });
    }
};

// 15. GET CHARACTERS
export const getCharacters = async (req, res) => {
    try {
        const { bookId } = req.query;
        if (!bookId) return res.status(400).json({ message: "Book ID wajib" });
        const characters = await Character.findAll({ where: { bookId }, order: [['id', 'ASC']] });
        res.status(200).json({ data: characters });
    } catch (error) {
        res.status(500).json({ message: "Error fetch karakter", error: error.message });
    }
};

// 16. GET BOOK DETAIL
export const getBookDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const book = await Book.findOne({
            where: { id, userId },
            include: [{ model: QuickIdea }, { model: MoodBoard }, { model: Research }, { model: Outline }, { model: Character }, { model: Setting }, { model: Timeline }, { model: Plot }]
        });
        if (!book) return res.status(404).json({ message: "Buku tidak ditemukan" });
        res.status(200).json({ data: book });
    } catch (error) {
        res.status(500).json({ message: "Error fetch detail", error: error.message });
    }
};

export const getChatHistory = async (req, res) => {
  try {
    const { bookId } = req.params;
    const history = await ChatMessage.findAll({
      where: { bookId },
      include: [{ model: User, as: 'sender', attributes: ['nama'] }],
      order: [['createdAt', 'ASC']],
      limit: 50
    });
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDiscussionHistory = async (req, res) => {
  try {
    const { discussionId } = req.params;
    
    // Contoh di controller riwayat chat
const messages = await ChatMessage.findAll({
  where: { discussionId },
  include: [{ model: User, as: 'sender', attributes: ['id', 'nama'] }], // Ambil ID dan Nama
  order: [['createdAt', 'ASC']]
});

    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ message: "Gagal memuat riwayat", error: error.message });
  }
};

// Ambil satu buku berdasarkan ID
export const getBookById = async (req, res) => {
    try {
        const { bookId } = req.params;

        const book = await Book.findByPk(bookId, {
            // Hapus 'as: user' jika tidak yakin dengan alias di model
            include: [
                { model: User, attributes: ['id', 'nama'] } 
            ]
        });

        if (!book) {
            return res.status(404).json({ message: "Buku tidak ditemukan" });
        }

        res.status(200).json({
            message: "Data buku berhasil diambil",
            data: book
        });
    } catch (error) {
        console.error("Error getBookById:", error); // Tambahkan ini untuk debug di terminal
        res.status(500).json({ 
            message: "Gagal mengambil data buku", 
            error: error.message 
        });
    }
};

// Tambahkan ini di bookController.js
export const getMyBooks = async (req, res) => {
    try {
        const userId = req.user.id; // Diambil dari verifyToken middleware
        const books = await Book.findAll({
            where: { userId },
            order: [['updatedAt', 'DESC']]
        });

        res.status(200).json({
            message: "Daftar buku berhasil diambil",
            data: books
        });
    } catch (error) {
        res.status(500).json({ message: "Gagal mengambil daftar buku", error: error.message });
    }
};