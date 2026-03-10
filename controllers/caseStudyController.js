import { NonFictionCaseStudy, Book } from "../models/index.js";

// 1. TAMBAH KASUS BARU
export const addCaseStudy = async (req, res) => {
  try {
    const { bookId, title } = req.body;
    if (!title) return res.status(400).json({ message: "Judul kasus wajib diisi" });

    // Validasi kepemilikan buku
    const book = await Book.findOne({ where: { id: bookId, userId: req.user.id } });
    if (!book) return res.status(404).json({ message: "Buku tidak ditemukan" });

    const caseStudy = await NonFictionCaseStudy.create(req.body);
    res.status(201).json({ message: "Studi kasus berhasil disimpan", data: caseStudy });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. AMBIL SEMUA KASUS BERDASARKAN BUKU
export const getCaseStudiesByBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const cases = await NonFictionCaseStudy.findAll({ 
      where: { bookId },
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json(cases);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. UPDATE KASUS
export const updateCaseStudy = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await NonFictionCaseStudy.update(req.body, { where: { id } });
    if (updated) {
      const updatedCase = await NonFictionCaseStudy.findByPk(id);
      return res.status(200).json({ message: "Studi kasus diperbarui", data: updatedCase });
    }
    throw new Error('Data tidak ditemukan');
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. HAPUS KASUS
export const deleteCaseStudy = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await NonFictionCaseStudy.destroy({ where: { id } });
    if (deleted) {
      return res.status(200).json({ message: "Studi kasus dihapus" });
    }
    throw new Error('Data tidak ditemukan');
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};