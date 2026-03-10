import { sequelize, Book, QuickIdea, MoodBoard, Research, Outline, Chapter, Character, Setting, Timeline, Plot, ReviewComment, ChapterVersion, DailyWordCount, ChatMessage, User, Discussion } from "../models/index.js";
import { Op } from "sequelize";

export const addQuickIdea = async (req, res) => {
    try {
        const { bookId, title, date, time, category, description, mood, reference, priority } = req.body;

        // Gabungkan date dan time menjadi satu objek Date
        const fullDateTime = new Date(`${date}T${time}`);

        const newIdea = await QuickIdea.create({
            bookId,
            title,
            date: fullDateTime,
            category_tag: category,
            description,
            mood,
            reference,
            priority
        });

        res.status(201).json({
            message: "Ide cepat berhasil disimpan",
            data: newIdea
        });
    } catch (error) {
        res.status(500).json({ message: "Gagal menyimpan ide", error: error.message });
    }
};

export const getQuickIdeas = async (req, res) => {
    try {
        const { bookId } = req.params;
        const ideas = await QuickIdea.findAll({
            where: { bookId },
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json(ideas);
    } catch (error) {
        res.status(500).json({ message: "Gagal mengambil data ide", error: error.message });
    }
};


// API: Update Ide Cepat
export const updateQuickIdea = async (req, res) => {
    try {
        const { id } = req.params; // ID dari Ide Cepat
        const { title, date, time, category, description, mood, reference, priority } = req.body;

        const idea = await QuickIdea.findByPk(id);
        if (!idea) return res.status(404).json({ message: "Ide tidak ditemukan" });

        // Gabungkan kembali date dan time jika diubah
        let fullDateTime = idea.date;
        if (date && time) {
            fullDateTime = new Date(`${date}T${time}`);
        }

        await idea.update({
            title,
            date: fullDateTime,
            category_tag: category,
            description,
            mood,
            reference,
            priority
        });

        res.status(200).json({ message: "Ide berhasil diperbarui", data: idea });
    } catch (error) {
        res.status(500).json({ message: "Gagal memperbarui ide", error: error.message });
    }
};

// API: Hapus Ide Cepat
export const deleteQuickIdea = async (req, res) => {
    try {
        const { id } = req.params;
        const idea = await QuickIdea.findByPk(id);
        
        if (!idea) return res.status(404).json({ message: "Ide tidak ditemukan" });

        await idea.destroy();
        res.status(200).json({ message: "Ide berhasil dihapus" });
    } catch (error) {
        res.status(500).json({ message: "Gagal menghapus ide", error: error.message });
    }
};