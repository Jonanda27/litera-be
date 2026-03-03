import { sequelize, Book, QuickIdea, MoodBoard, Research, Outline,Chapter } from "../models/index.js";

export const saveChapterContent = async (req, res) => {
  try {
    const { bookId, chapterId, title, content, wordCount, dailyTarget } = req.body;

    // Jika chapterId ada, maka update. Jika tidak ada, buat baru (Upsert logic)
    if (chapterId) {
      await Chapter.update({
        title,
        content, // Ini akan berisi string HTML (ex: <p><b>Halo</b></p>)
        word_count: wordCount,
        daily_target: dailyTarget,
        updatedAt: new Date()
      }, {
        where: { id: chapterId }
      });
      
      return res.status(200).json({ message: "Bab berhasil diperbarui!" });
    } else {
      const newChapter = await Chapter.create({
        bookId,
        title: title || "Bab Tanpa Judul",
        content,
        word_count: wordCount,
        daily_target: dailyTarget || 1000,
        is_safe: true
      });
      
      return res.status(201).json({ 
        message: "Bab baru berhasil disimpan!", 
        chapterId: newChapter.id 
      });
    }
  } catch (error) {
    console.error("Save Chapter Error:", error);
    res.status(500).json({ message: "Gagal menyimpan teks", error: error.message });
  }
};

export const savePramenulis = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const userId = req.user.id;
    const { 
      title, 
      ideCepat, 
      moodBoards, 
      researches, 
      outlines 
    } = req.body;

    // 1. Simpan Buku
    const newBook = await Book.create({
      title: title || "Buku Tanpa Judul",
      userId: userId
    }, { transaction: t });

    // 2. Simpan Ide Cepat
    if (ideCepat && ideCepat.title) {
      await QuickIdea.create({
        bookId: newBook.id,
        title: ideCepat.title,
        description: ideCepat.description,
        category_tag: ideCepat.tag,
        date: ideCepat.date || new Date()
      }, { transaction: t });
    }

    // 3. Simpan Mood Boards (Bulk)
    if (moodBoards && moodBoards.length > 0) {
      const moodBoardData = moodBoards.map(mb => ({
        bookId: newBook.id,
        image_url: mb.image_url,
        category: mb.category
      }));
      await MoodBoard.bulkCreate(moodBoardData, { transaction: t });
    }

    // 4. Simpan Riset (Bulk)
    if (researches && researches.length > 0) {
      const researchData = researches.map(rs => ({
        bookId: newBook.id,
        source_title: rs.source_title,
        link_url: rs.link_url, // Menyimpan URL atau Base64 String
        notes: rs.notes
      }));
      await Research.bulkCreate(researchData, { transaction: t });
    }

    // 5. Simpan Outline (Bulk) - Sinkronisasi Field FE (sub1, sub2)
    if (outlines && outlines.length > 0) {
      const outlineData = outlines.map((ot, index) => ({
        bookId: newBook.id,
        chapter_number: index + 1,
        title: ot.title || `Bab ${index + 1}`,
        // Mapping sub1 & sub2 ke summary di Database
        summary: `${ot.sub1 || ''}\n${ot.sub2 || ''}`.trim(), 
        order_index: index
      }));
      await Outline.bulkCreate(outlineData, { transaction: t });
    }

    await t.commit();
    res.status(201).json({ 
      message: "Proyek Pramenulis berhasil disimpan!", 
      bookId: newBook.id 
    });

  } catch (error) {
    await t.rollback();
    console.error("Error saving Pramenulis:", error);
    res.status(500).json({ message: "Terjadi kesalahan server", error: error.message });
  }
};