import { Meeting } from "../models/index.js";
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
        const meeting = await Meeting.findByPk(req.params.id);
        if (!meeting) {
            return res.status(404).json({ success: false, message: "Meeting tidak ditemukan" });
        }
        res.json({ success: true, data: meeting });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// controllers/meetingController.js

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