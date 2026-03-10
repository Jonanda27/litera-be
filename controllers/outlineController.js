// controllers/outlineController.js
import { Outline } from "../models/index.js";

// CREATE: Tambah Bab Baru
export const createOutline = async (req, res) => {
  try {
    const { bookId, number, title, pov, location, time, subChapters, notes, status } = req.body;
    
    const newOutline = await Outline.create({
      bookId,
      chapter_number: number,
      title,
      pov,
      location,
      time_setting: time,
      sub_chapters: subChapters, // Langsung simpan array object 
      notes,
      status
    });

    res.status(201).json({ message: "Outline bab disimpan", data: newOutline });
  } catch (error) {
    res.status(500).json({ message: "Gagal simpan outline", error: error.message });
  }
};

// READ: Ambil semua bab dalam satu buku
export const getOutlinesByBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const data = await Outline.findAll({
      where: { bookId },
      order: [['createdAt', 'ASC']]
    });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil data", error: error.message });
  }
};

// UPDATE: Perbarui data bab (termasuk sub_chapters)
export const updateOutline = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const outline = await Outline.findByPk(id);
    if (!outline) return res.status(404).json({ message: "Data tidak ditemukan" });

    // Mapping field dari frontend ke DB
    await outline.update({
      chapter_number: updateData.number || outline.chapter_number,
      title: updateData.title || outline.title,
      pov: updateData.pov || outline.pov,
      location: updateData.location || outline.location,
      time_setting: updateData.time || outline.time_setting,
      sub_chapters: updateData.subChapters || outline.sub_chapters,
      notes: updateData.notes || outline.notes,
      status: updateData.status || outline.status
    });

    res.status(200).json({ message: "Berhasil diperbarui", data: outline });
  } catch (error) {
    res.status(500).json({ message: "Gagal update", error: error.message });
  }
};

// DELETE: Hapus bab
export const deleteOutline = async (req, res) => {
  try {
    await Outline.destroy({ where: { id: req.params.id } });
    res.status(200).json({ message: "Bab berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: "Gagal hapus", error: error.message });
  }
};