import { MoodBoard, Book } from "../models/index.js";

// CREATE: Tambah Item Vision Board
export const addVisionItem = async (req, res) => {
    try {
        const { bookId, title, type, content, description, connections, dominantColor } = req.body;

        const newItem = await MoodBoard.create({
            bookId,
            board_title: title,
            content_type: type === 'image' ? 'Upload Gambar' : type === 'link' ? 'Link URL' : 'Warna / Palet',
            image_url: content, // Menyimpan URL link atau path gambar
            visual_description: description,
            connection_to: connections, // Disimpan sebagai JSONB
            dominant_color: dominantColor
        });

        res.status(201).json({ message: "Inspirasi berhasil ditambahkan", data: newItem });
    } catch (error) {
        res.status(500).json({ message: "Gagal menambah inspirasi", error: error.message });
    }
};

// READ: Ambil semua item berdasarkan Book ID
export const getVisionBoard = async (req, res) => {
    try {
        const { bookId } = req.params;
        const items = await MoodBoard.findAll({
            where: { bookId },
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ message: "Gagal mengambil data", error: error.message });
    }
};

// UPDATE: Edit Item
export const updateVisionItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, type, content, description, connections, dominantColor } = req.body;

        const item = await MoodBoard.findByPk(id);
        if (!item) return res.status(404).json({ message: "Item tidak ditemukan" });

        await item.update({
            board_title: title,
            content_type: type === 'image' ? 'Upload Gambar' : type === 'link' ? 'Link URL' : 'Warna / Palet',
            image_url: content,
            visual_description: description,
            connection_to: connections,
            dominant_color: dominantColor
        });

        res.status(200).json({ message: "Item diperbarui", data: item });
    } catch (error) {
        res.status(500).json({ message: "Gagal memperbarui item", error: error.message });
    }
};

// DELETE: Hapus Item
export const deleteVisionItem = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await MoodBoard.findByPk(id);
        if (!item) return res.status(404).json({ message: "Item tidak ditemukan" });

        await item.destroy();
        res.status(200).json({ message: "Item berhasil dihapus" });
    } catch (error) {
        res.status(500).json({ message: "Gagal menghapus item", error: error.message });
    }
};