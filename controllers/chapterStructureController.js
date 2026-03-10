import { NonFictionChapterStructure, Book } from "../models/index.js";

// 1. TAMBAH STRUKTUR BAB
export const addChapterStructure = async (req, res) => {
  try {
    const { bookId, title } = req.body;
    if (!title) return res.status(400).json({ message: "Judul bab wajib diisi" });

    // Cek kepemilikan buku
    const book = await Book.findOne({ where: { id: bookId, userId: req.user.id } });
    if (!book) return res.status(404).json({ message: "Buku tidak ditemukan" });

    const structure = await NonFictionChapterStructure.create(req.body);
    res.status(201).json({ message: "Struktur bab berhasil disimpan", data: structure });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. AMBIL SEMUA STRUKTUR BERDASARKAN BUKU
export const getStructuresByBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const structures = await NonFictionChapterStructure.findAll({ 
      where: { bookId },
      order: [['chapterNumber', 'ASC']]
    });
    res.status(200).json(structures);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. UPDATE STRUKTUR
export const updateChapterStructure = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await NonFictionChapterStructure.update(req.body, { where: { id } });
    if (updated) {
      const updatedData = await NonFictionChapterStructure.findByPk(id);
      return res.status(200).json({ message: "Struktur diperbarui", data: updatedData });
    }
    throw new Error('Data tidak ditemukan');
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. HAPUS STRUKTUR
export const deleteChapterStructure = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await NonFictionChapterStructure.destroy({ where: { id } });
    if (deleted) {
      return res.status(200).json({ message: "Struktur bab berhasil dihapus" });
    }
    throw new Error('Data tidak ditemukan');
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};