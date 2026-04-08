import { NonFictionSource, Book } from "../models/index.js";

// 1. TAMBAH SUMBER BARU
export const addSource = async (req, res) => {
  try {
    const { bookId, title } = req.body;
    if (!title) return res.status(400).json({ message: "Judul sumber wajib diisi" });

    // Validasi kepemilikan buku
    const book = await Book.findOne({ where: { id: bookId, userId: req.user.id } });
    if (!book) return res.status(404).json({ message: "Buku tidak ditemukan" });

    const source = await NonFictionSource.create(req.body);
    res.status(201).json({ message: "Sumber berhasil ditambahkan", data: source });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. AMBIL SEMUA SUMBER BERDASARKAN BUKU
export const getSourcesByBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const sources = await NonFictionSource.findAll({ 
      where: { bookId },
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json(sources);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. UPDATE SUMBER
export const updateSource = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await NonFictionSource.update(req.body, { where: { id } });
    if (updated) {
      const updatedSource = await NonFictionSource.findByPk(id);
      return res.status(200).json({ message: "Sumber diperbarui", data: updatedSource });
    }
    throw new Error('Sumber tidak ditemukan');
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. HAPUS SUMBER
export const deleteSource = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await NonFictionSource.destroy({ where: { id } });
    if (deleted) {
      return res.status(200).json({ message: "Sumber berhasil dihapus" });
    }
    throw new Error('Sumber tidak ditemukan');
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};