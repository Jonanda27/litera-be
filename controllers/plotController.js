// controllers/plotController.js
import { Plot } from "../models/index.js";

// 1. CREATE: Simpan Adegan Baru
export const createPlot = async (req, res) => {
  try {
    const plot = await Plot.create(req.body);
    res.status(201).json({ success: true, data: plot });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. READ: Ambil Semua Adegan berdasarkan bookId
export const getPlotsByBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const plots = await Plot.findAll({ 
      where: { bookId },
      order: [['createdAt', 'ASC']] // Urutan berdasarkan waktu dibuat
    });
    res.status(200).json(plots);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. UPDATE: Edit Detail Adegan
export const updatePlot = async (req, res) => {
  try {
    const { id } = req.params;
    await Plot.update(req.body, { where: { id } });
    const updatedPlot = await Plot.findByPk(id);
    res.status(200).json({ success: true, data: updatedPlot });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. DELETE: Hapus Adegan
export const deletePlot = async (req, res) => {
  try {
    const { id } = req.params;
    await Plot.destroy({ where: { id } });
    res.status(200).json({ success: true, message: "Adegan berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};