// controllers/characterController.js
import { Character } from "../models/index.js";

// 1. TAMBAH KARAKTER
export const createCharacter = async (req, res) => {
  try {
    const character = await Character.create(req.body);
    res.status(201).json({ message: "Karakter berhasil dibuat", data: character });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. AMBIL SEMUA KARAKTER BERDASARKAN BUKU
export const getCharactersByBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const characters = await Character.findAll({ 
      where: { bookId },
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json(characters);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. UPDATE KARAKTER
export const updateCharacter = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await Character.update(req.body, { where: { id } });
    if (updated) {
      const updatedCharacter = await Character.findByPk(id);
      return res.status(200).json({ message: "Karakter diperbarui", data: updatedCharacter });
    }
    throw new Error('Karakter tidak ditemukan');
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. HAPUS KARAKTER
export const deleteCharacter = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Character.destroy({ where: { id } });
    if (deleted) {
      return res.status(200).json({ message: "Karakter berhasil dihapus" });
    }
    throw new Error('Karakter tidak ditemukan');
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};