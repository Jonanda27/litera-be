import { NonFictionResearch, Book, NonFictionChapterContent } from "../models/index.js";
import { Op } from 'sequelize';
// SAVE (CREATE or UPDATE)
export const saveNonFictionResearch = async (req, res) => {
  try {
    const { bookId, ...updateData } = req.body;
    const userId = req.user.id;

    // Pastikan buku milik user tersebut
    const book = await Book.findOne({ where: { id: bookId, userId } });
    if (!book) return res.status(404).json({ message: "Akses ditolak atau buku tidak ditemukan" });

    // Cari data riset yang sudah ada
    const existingResearch = await NonFictionResearch.findOne({ where: { bookId } });

    if (existingResearch) {
      await existingResearch.update(updateData);
      return res.status(200).json({ message: "Strategi buku diperbarui", data: existingResearch });
    } else {
      const newResearch = await NonFictionResearch.create({ bookId, ...updateData });
      return res.status(201).json({ message: "Strategi buku berhasil disimpan", data: newResearch });
    }
  } catch (error) {
    res.status(500).json({ message: "Gagal menyimpan riset", error: error.message });
  }
};

// GET BY BOOK ID
export const getNonFictionResearch = async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.user.id;

    const research = await NonFictionResearch.findOne({
      where: { bookId },
      include: [{ model: Book, where: { userId } }]
    });

    if (!research) {
      return res.status(200).json({ data: null, message: "Data belum ada" });
    }

    res.status(200).json({ data: research });
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil data", error: error.message });
  }
};

// DELETE
export const deleteNonFictionResearch = async (req, res) => {
    try {
        const { bookId } = req.params;
        await NonFictionResearch.destroy({ where: { bookId } });
        res.status(200).json({ message: "Data berhasil dihapus" });
    } catch (error) {
        res.status(500).json({ message: "Gagal menghapus data", error: error.message });
    }
};

export const saveChapterContentnonfiksi = async (req, res) => {
  try {
    const { bookId, chapterNumber, pages } = req.body;
    // `pages` yang diharapkan dari frontend berupa array of objects:
    // [{ pageNumber: 1, content: "...", wordCount: 150 }, { pageNumber: 2, content: "...", wordCount: 200 }]

    if (!pages || !Array.isArray(pages)) {
      return res.status(400).json({ message: "Format data pages tidak valid (harus array)" });
    }

    // 1. Simpan atau Update tiap halaman
    for (const page of pages) {
      const [record, created] = await NonFictionChapterContent.findOrCreate({
        where: { bookId, chapterNumber, pageNumber: page.pageNumber },
        defaults: { content: page.content, wordCount: page.wordCount || 0 }
      });

      if (!created) {
        await record.update({ content: page.content, wordCount: page.wordCount || 0 });
      }
    }

    // 2. Hapus halaman yang terhapus di frontend (Cleanup)
    // Jika di DB ada halaman 1, 2, 3 tapi frontend cuma kirim halaman 1 & 2, maka halaman 3 dihapus.
    const incomingPageNumbers = pages.map(p => p.pageNumber);
    
    await NonFictionChapterContent.destroy({
      where: {
        bookId,
        chapterNumber,
        pageNumber: {
          [Op.notIn]: incomingPageNumbers
        }
      }
    });

    res.status(200).json({ success: true, message: "Seluruh halaman berhasil disimpan" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// AMBIL KONTEN (MULTI-PAGE)
export const getChapterContentnonfiksi = async (req, res) => {
  try {
    const { bookId, chapterNumber } = req.query;
    
    // Gunakan findAll dan urutkan berdasar pageNumber
    const data = await NonFictionChapterContent.findAll({
      where: { bookId, chapterNumber },
      order: [['pageNumber', 'ASC']]
    });

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};