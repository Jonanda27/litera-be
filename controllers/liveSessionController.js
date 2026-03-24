import { LiveSession } from "../models/index.js";
import { v4 as uuidv4 } from "uuid";

export const createLiveSession = async (req, res) => {
    try {
        const { title, description, speaker_name, scheduled_at } = req.body;

        // Simpan path gambar poster
        const poster_url = req.file ? `/uploads/posters/${req.file.filename}` : null;

        // Room name langsung dibuat di sini dan disimpan di tabel ini juga
        const room_name = `live-broadcast-${uuidv4().substring(0, 8)}`;

        const newLive = await LiveSession.create({
            title,
            description,
            speaker_name,
            scheduled_at,
            poster_url,
            room_name,
            status: 'active'
        });

        res.status(201).json({ success: true, data: newLive });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Saat sesi selesai, admin tinggal update kolom recording_url di tabel yang sama
export const endLiveSession = async (req, res) => {
    try {
        const { id } = req.params; // ID LiveSession
        //const { recording_url } = req.body;

        // Update status menjadi 'ended' dan simpan link youtube
        const updatedSession = await LiveSession.update({
            //recording_url: recording_url,
            status: 'ended'
        }, {
            where: { id }
        });

        res.json({ success: true, message: "Rekaman berhasil disimpan!", data: updatedSession });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAllLiveSessions = async (req, res) => {
    try {
        const sessions = await LiveSession.findAll({ order: [['scheduled_at', 'DESC']] });
        res.json({ success: true, data: sessions });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getLiveSessionById = async (req, res) => {
    try {
        const session = await LiveSession.findByPk(req.params.id);
        if (!session) return res.status(404).json({ message: "Sesi tidak ditemukan" });
        res.json({ success: true, data: session });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteLiveSession = async (req, res) => {
    try {
        const session = await LiveSession.findByPk(req.params.id);
        if (!session) return res.status(404).json({ message: "Data tidak ada" });

        // Hapus file poster fisik jika perlu di sini (fs.unlink)

        await session.destroy();
        res.json({ success: true, message: "Sesi berhasil dihapus" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

