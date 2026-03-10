// litera-be/controllers/discussionController.js
import { Discussion } from "../models/index.js";

// 1. Ambil semua daftar grup diskusi dari database
export const getAllDiscussions = async (req, res) => {
  try {
    const discussions = await Discussion.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json({ success: true, data: discussions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Buat grup diskusi baru oleh user
export const createDiscussion = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: "Nama ruangan wajib diisi" });

    const newDiscussion = await Discussion.create({ 
      name, 
      description: description || "Ruang diskusi baru" 
    });
    res.status(201).json({ success: true, data: newDiscussion });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};