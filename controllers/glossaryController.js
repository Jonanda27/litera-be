import { Glossary, Book } from "../models/index.js";

// 1. TAMBAH ISTILAH BARU
export const createGlossary = async (req, res) => {
  try {
    const { bookId } = req.body;
    // Cek kepemilikan buku
    const book = await Book.findOne({ where: { id: bookId, userId: req.user.id } });
    if (!book) return res.status(404).json({ message: "Buku tidak ditemukan" });

    const item = await Glossary.create(req.body);
    res.status(201).json({ message: "Istilah berhasil ditambahkan", data: item });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. AMBIL SEMUA ISTILAH BERDASARKAN BUKU
export const getGlossaryByBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const items = await Glossary.findAll({ 
      where: { bookId },
      order: [['term', 'ASC']]
    });
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. UPDATE ISTILAH
export const updateGlossary = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await Glossary.update(req.body, { where: { id } });
    if (updated) {
      const updatedItem = await Glossary.findByPk(id);
      return res.status(200).json({ message: "Istilah diperbarui", data: updatedItem });
    }
    throw new Error('Istilah tidak ditemukan');
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. HAPUS ISTILAH
export const deleteGlossary = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Glossary.destroy({ where: { id } });
    if (deleted) {
      return res.status(200).json({ message: "Istilah berhasil dihapus" });
    }
    throw new Error('Istilah tidak ditemukan');
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};