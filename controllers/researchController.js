import { Research } from "../models/index.js";

// CREATE: Simpan Riset Baru
export const addResearch = async (req, res) => {
    try {
        const { 
            bookId, title, sourceType, reference, tags, 
            importantQuotes, pageOrTime, credibility, usagePlan 
        } = req.body;

        // Gabungkan page dan time untuk kolom reference_point di DB
        const refPoint = `${pageOrTime?.page || ''}|${pageOrTime?.time || ''}`;

        const newResearch = await Research.create({
            bookId,
            source_title: title,
            source_type: sourceType === 'article' ? 'Artikel Online' : 
                         sourceType === 'book' ? 'Buku' : 
                         sourceType === 'video' ? 'Video YouTube' :
                         sourceType === 'podcast' ? 'Podcast' :
                         sourceType === 'interview' ? 'Wawancara' : 'Catatan Pribadi',
            link_url: reference,
            topics: tags ? tags.join(', ') : '',
            important_quote: importantQuotes,
            reference_point: refPoint,
            credibility: credibility || 0,
            usage_plan: usagePlan
        });

        res.status(201).json({ message: "Riset berhasil disimpan", data: newResearch });
    } catch (error) {
        res.status(500).json({ message: "Gagal menyimpan riset", error: error.message });
    }
};

// READ: Ambil semua riset berdasarkan bookId
export const getResearchesByBook = async (req, res) => {
    try {
        const { bookId } = req.params;
        const data = await Research.findAll({
            where: { bookId },
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: "Gagal mengambil data", error: error.message });
    }
};

// DELETE: Hapus Riset
export const deleteResearch = async (req, res) => {
    try {
        const { id } = req.params;
        await Research.destroy({ where: { id } });
        res.status(200).json({ message: "Riset berhasil dihapus" });
    } catch (error) {
        res.status(500).json({ message: "Gagal menghapus riset", error: error.message });
    }
};

// UPDATE: Perbarui Riset
export const updateResearch = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            title, sourceType, reference, tags, 
            importantQuotes, pageOrTime, credibility, usagePlan 
        } = req.body;

        // Cari dulu apakah datanya ada
        const research = await Research.findByPk(id);
        if (!research) {
            return res.status(404).json({ message: "Riset tidak ditemukan" });
        }

        // Gabungkan page dan time untuk kolom reference_point (jika ada update)
        const refPoint = pageOrTime ? `${pageOrTime?.page || ''}|${pageOrTime?.time || ''}` : research.reference_point;

        // Eksekusi update
        await Research.update({
            source_title: title || research.source_title,
            source_type: sourceType ? (
                sourceType === 'article' ? 'Artikel Online' : 
                sourceType === 'book' ? 'Buku' : 
                sourceType === 'video' ? 'Video YouTube' :
                sourceType === 'podcast' ? 'Podcast' :
                sourceType === 'interview' ? 'Wawancara' : 'Catatan Pribadi'
            ) : research.source_type,
            link_url: reference || research.link_url,
            topics: tags ? tags.join(', ') : research.topics,
            important_quote: importantQuotes || research.important_quote,
            reference_point: refPoint,
            credibility: credibility !== undefined ? credibility : research.credibility,
            usage_plan: usagePlan || research.usage_plan
        }, {
            where: { id }
        });

        // Ambil data terbaru untuk dikembalikan di response
        const updatedData = await Research.findByPk(id);

        res.status(200).json({ 
            message: "Riset berhasil diperbarui", 
            data: updatedData 
        });
    } catch (error) {
        res.status(500).json({ 
            message: "Gagal memperbarui riset", 
            error: error.message 
        });
    }
};