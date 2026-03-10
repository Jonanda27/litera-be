import { NonFictionResearch, Book, NonFictionChapterContent } from "../models/index.js";

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
    const { bookId, chapterNumber, content, wordCount } = req.body;
    // Cari draf lama, jika ada update, jika tidak ada buat baru
    const [record, created] = await NonFictionChapterContent.findOrCreate({
      where: { bookId, chapterNumber },
      defaults: { content, wordCount }
    });

    if (!created) {
      await record.update({ content, wordCount });
    }
    res.status(200).json({ success: true, message: "Konten bab berhasil disimpan" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Ambil Konten Bab Tertentu
export const getChapterContentnonfiksi = async (req, res) => {
  try {
    const { bookId, chapterNumber } = req.query;
    const data = await NonFictionChapterContent.findOne({
      where: { bookId, chapterNumber }
    });
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};