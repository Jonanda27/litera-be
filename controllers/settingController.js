// controllers/settingController.js
import { Setting } from "../models/index.js";

// CREATE: Simpan lokasi baru
export const createSetting = async (req, res) => {
  try {
    const setting = await Setting.create(req.body);
    res.status(201).json({ message: "Lokasi berhasil disimpan", data: setting });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// READ: Ambil semua lokasi berdasarkan bookId
export const getSettingsByBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const settings = await Setting.findAll({ where: { bookId }, order: [['createdAt', 'DESC']] });
    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE: Perbarui data lokasi
export const updateSetting = async (req, res) => {
  try {
    const { id } = req.params;
    await Setting.update(req.body, { where: { id } });
    const updated = await Setting.findByPk(id);
    res.status(200).json({ message: "Data diperbarui", data: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE: Hapus lokasi
export const deleteSetting = async (req, res) => {
  try {
    const { id } = req.params;
    await Setting.destroy({ where: { id } });
    res.status(200).json({ message: "Lokasi berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};