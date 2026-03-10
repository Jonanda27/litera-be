import { QuoteCollection, Book } from "../models/index.js";

// 1. TAMBAH KUTIPAN BARU
export const addQuote = async (req, res) => {
  try {
    const { bookId, text } = req.body;
    if (!text) return res.status(400).json({ message: "Isi kutipan wajib diisi" });

    // Validasi kepemilikan buku
    const book = await Book.findOne({ where: { id: bookId, userId: req.user.id } });
    if (!book) return res.status(404).json({ message: "Buku tidak ditemukan" });

    const quote = await QuoteCollection.create(req.body);
    res.status(201).json({ message: "Kutipan berhasil disimpan", data: quote });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. AMBIL SEMUA KUTIPAN BERDASARKAN BUKU
export const getQuotesByBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const quotes = await QuoteCollection.findAll({ 
      where: { bookId },
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json(quotes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. UPDATE KUTIPAN
export const updateQuote = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await QuoteCollection.update(req.body, { where: { id } });
    if (updated) {
      const updatedQuote = await QuoteCollection.findByPk(id);
      return res.status(200).json({ message: "Kutipan diperbarui", data: updatedQuote });
    }
    throw new Error('Kutipan tidak ditemukan');
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. HAPUS KUTIPAN
export const deleteQuote = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await QuoteCollection.destroy({ where: { id } });
    if (deleted) {
      return res.status(200).json({ message: "Kutipan berhasil dihapus" });
    }
    throw new Error('Kutipan tidak ditemukan');
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};