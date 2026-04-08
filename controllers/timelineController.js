// controllers/timelineController.js
import { Timeline } from "../models/index.js";

// 1. TAMBAH TITIK WAKTU (CREATE)
export const createTimelineEvent = async (req, res) => {
  try {
    const event = await Timeline.create(req.body);
    res.status(201).json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. AMBIL SEMUA PERISTIWA BERDASARKAN BUKU (READ)
export const getTimelineEventsByBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const events = await Timeline.findAll({ 
      where: { bookId },
      order: [['event_order', 'ASC']]
    });
    res.status(200).json({ success: true, data: events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. UPDATE PERISTIWA (UPDATE)
export const updateTimelineEvent = async (req, res) => {
  try {
    const { id } = req.params;
    await Timeline.update(req.body, { where: { id } });
    const updatedEvent = await Timeline.findByPk(id);
    res.status(200).json({ success: true, data: updatedEvent });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. HAPUS PERISTIWA (DELETE)
export const deleteTimelineEvent = async (req, res) => {
  try {
    const { id } = req.params;
    await Timeline.destroy({ where: { id } });
    res.status(200).json({ success: true, message: "Peristiwa berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};