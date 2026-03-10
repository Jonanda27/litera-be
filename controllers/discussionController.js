// litera-be/controllers/discussionController.js
import { Discussion,User, DiscussionMember } from "../models/index.js";

// Ambil semua daftar grup diskusi
export const getAllDiscussions = async (req, res) => {
  try {
    const discussions = await Discussion.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json({ success: true, data: discussions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Ambil semua grup yang SUDAH DIIKUTI oleh user (Data Lengkap) 
export const getMyJoinedDiscussions = async (req, res) => {
  try {
    const userId = req.user.id; // Diambil dari middleware verifyToken [cite: 1664]

    // Mencari user beserta asosiasi grup yang diikuti melalui tabel junction
    const userWithGroups = await User.findByPk(userId, {
      include: [{
        model: Discussion,
        as: 'joinedDiscussions', // Pastikan alias ini sesuai di models/index.js [cite: 1845]
        through: { attributes: [] } // Sembunyikan kolom dari tabel junction
      }]
    });

    if (!userWithGroups) {
      return res.status(404).json({ success: false, message: "User tidak ditemukan" });
    }

    res.status(200).json({ success: true, data: userWithGroups.joinedDiscussions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createDiscussion = async (req, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.user.id; // Diambil dari middleware auth [cite: 1665]

    if (!name) return res.status(400).json({ message: "Nama ruangan wajib diisi" });

    // 1. Buat record diskusi baru
    const newDiscussion = await Discussion.create({ 
      name, 
      description: description || "Ruang diskusi baru",
      owner_id: userId // Simpan ID si pembuat
    });

    // 2. OTOMATIS GABUNG: Buat record di tabel DiscussionMember [cite: 1841, 1845]
    await DiscussionMember.create({
      discussion_id: newDiscussion.id,
      user_id: userId
    });

    res.status(201).json({ 
      success: true, 
      message: "Ruang diskusi berhasil dibuat dan Anda otomatis bergabung", 
      data: newDiscussion 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const joinDiscussion = async (req, res) => {
  try {
    const { discussionId } = req.body;
    const userId = req.user.id;

    // Cek apakah sudah terdaftar
    const existing = await DiscussionMember.findOne({
      where: { discussion_id: discussionId, user_id: userId }
    });

    if (existing) return res.status(200).json({ success: true, message: "Sudah bergabung" });

    await DiscussionMember.create({ discussion_id: discussionId, user_id: userId });
    res.status(201).json({ success: true, message: "Berhasil bergabung ke grup" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getDiscussionMembers = async (req, res) => {
  try {
    const { discussionId } = req.params;

    const discussion = await Discussion.findByPk(discussionId, {
      include: [{
        model: User,
        as: 'members', // Sesuai alias di models/index.js [cite: 1845]
        attributes: ['id', 'nama'],
        through: { attributes: [] } // Menghilangkan data tabel junction dari output
      }]
    });

    if (!discussion) {
      return res.status(404).json({ success: false, message: "Ruang diskusi tidak ditemukan" });
    }

    res.status(200).json({ success: true, data: discussion.members });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};