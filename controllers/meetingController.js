import { Meeting, Discussion } from "../models/index.js";
import { v4 as uuidv4 } from "uuid";

export const createMeeting = async (req, res) => {
    try {
        const { title, description } = req.body;
        const moderator_id = req.user.id;

        const slug = title.replace(/\s+/g, '-').toLowerCase();
        const room_name = `${slug}-${uuidv4().substring(0, 8)}`;

        const newMeeting = await Meeting.create({
            title,
            description,
            room_name,
            moderator_id,
            status: 'active'
        });

        res.status(201).json({
            message: "Meeting berhasil dibuat",
            data: newMeeting
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAllMeetings = async (req, res) => {
    try {
        const meetings = await Meeting.findAll({
            where: { status: 'active' },
            order: [['createdAt', 'DESC']]
        });
        res.json({ success: true, data: meetings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getMeetingById = async (req, res) => {
    try {
        const { id } = req.params;

        const meeting = await Meeting.findByPk(id, {
            include: [
                {
                    model: Discussion,
                    attributes: ['id', 'name', 'owner_id']
                }
            ]
        });

        if (!meeting) {
            return res.status(404).json({ success: false, message: "Meeting tidak ditemukan" });
        }

        res.json({ success: true, data: meeting });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const endMeeting = async (req, res) => {
    try {
        const { roomName } = req.params;
        const moderator_id = req.user.id;

        const meeting = await Meeting.findOne({ where: { room_name: roomName } });

        if (!meeting) {
            return res.status(404).json({ message: "Meeting tidak ditemukan" });
        }

        if (meeting.moderator_id !== moderator_id) {
            return res.status(403).json({ message: "Hanya moderator yang bisa mengakhiri sesi" });
        }

        meeting.status = 'ended';
        await meeting.save();

        res.json({ success: true, message: "Meeting telah berakhir" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const startDiscussionMeeting = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // 1. Cari Discussion dan pastikan dia ada
        const discussion = await Discussion.findByPk(id);

        if (!discussion) {
            return res.status(404).json({ message: "Grup diskusi tidak ditemukan" });
        }

        // 2. OTORITAS: Cek apakah user yang request adalah owner_id dari discussion
        if (String(discussion.owner_id) !== String(userId)) {
            return res.status(403).json({
                message: "Hanya pemilik grup yang dapat memulai meeting online"
            });
        }

        // 3. Cek apakah sudah ada meeting yang sedang aktif di grup ini
        // (Opsional: Jika ingin mencegah double meeting)
        const existingMeeting = await Meeting.findOne({
            where: {
                id: discussion.meeting_id,
                status: 'active'
            }
        });

        if (existingMeeting) {
            return res.status(200).json({
                message: "Meeting sudah berjalan",
                data: existingMeeting
            });
        }

        // 4. Buat Room Name Jitsi yang unik
        const slug = discussion.name.toLowerCase().replace(/[^a-z0-9]/g, "-");
        const room_name = `discussion-${id}-${slug}-${uuidv4().substring(0, 6)}`;

        // 5. Simpan di tabel Meeting
        const newMeeting = await Meeting.create({
            title: `Meeting: ${discussion.name}`,
            room_name: room_name,
            status: 'active'
        });

        // 6. UPDATE tabel Discussion untuk menyimpan meeting_id yang baru dibuat
        discussion.meeting_id = newMeeting.id;
        await discussion.save();

        res.status(201).json({
            success: true,
            message: "Meeting berhasil dimulai",
            data: newMeeting
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getDiscussionDetails = async (req, res) => {
    try {
        const { id } = req.params;

        // Ambil diskusi beserta data meeting-nya (menggunakan include/relasi)
        const discussion = await Discussion.findByPk(id, {
            include: [
                {
                    model: Meeting,
                    as: 'active_meeting', // Pastikan alias sesuai dengan di model/index.js
                }
            ]
        });

        if (!discussion) {
            return res.status(404).json({ message: "Diskusi tidak ditemukan" });
        }

        res.json({ success: true, data: discussion });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const endDiscussionMeeting = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const discussion = await Discussion.findByPk(id);

        if (String(discussion.owner_id) !== String(userId)) {
            return res.status(403).json({ message: "Hanya pembuat grup yang bisa menutup sesi" });
        }

        if (discussion.meeting_id) {
            // Update status meeting menjadi ended
            await Meeting.update(
                { status: 'ended' },
                { where: { id: discussion.meeting_id } }
            );

            // Lepaskan link meeting dari discussion
            discussion.meeting_id = null;
            await discussion.save();
        }

        res.json({ message: "Sesi meeting ditutup" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};