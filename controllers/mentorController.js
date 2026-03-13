import MentorService from '../services/mentorService.js';

class MentorController {
    /**
     * Mengambil daftar seluruh mentor
     * @route GET /api/mentors
     */
    static async getAllMentors(req, res) {
        try {
            const mentors = await MentorService.getAllMentors();
            return res.status(200).json({
                success: true,
                message: 'Data mentor berhasil diambil.',
                data: mentors
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan internal server.',
                error: error.message
            });
        }
    }

    /**
     * Mengambil detail mentor spesifik berdasarkan ID
     * @route GET /api/mentors/:id
     */
    static async getMentorById(req, res) {
        try {
            const { id } = req.params;
            const mentor = await MentorService.getMentorById(id);

            return res.status(200).json({
                success: true,
                message: 'Detail mentor berhasil diambil.',
                data: mentor
            });
        } catch (error) {
            // Jika pesan error spesifik dari service (Not Found)
            if (error.message === 'Mentor tidak ditemukan.') {
                return res.status(404).json({ success: false, message: error.message });
            }
            return res.status(500).json({ success: false, error: error.message });
        }
    }

    /**
     * Mendaftarkan mentor baru
     * @route POST /api/mentors
     */
    static async createMentor(req, res) {
        try {
            const newMentor = await MentorService.createMentor(req.body);

            return res.status(201).json({
                success: true,
                message: 'Mentor berhasil didaftarkan.',
                data: newMentor
            });
        } catch (error) {
            // Menangkap error validasi bisnis (seperti email duplikat)
            if (error.message === 'Email sudah terdaftar sebagai Mentor.') {
                return res.status(400).json({ success: false, message: error.message });
            }
            return res.status(500).json({ success: false, error: error.message });
        }
    }

    /**
     * Memperbarui data mentor
     * @route PUT /api/mentors/:id
     */
    static async updateMentor(req, res) {
        try {
            const { id } = req.params;
            const updatedMentor = await MentorService.updateMentor(id, req.body);

            return res.status(200).json({
                success: true,
                message: 'Data mentor berhasil diperbarui.',
                data: updatedMentor
            });
        } catch (error) {
            if (error.message === 'Mentor tidak ditemukan.') {
                return res.status(404).json({ success: false, message: error.message });
            }
            return res.status(500).json({ success: false, error: error.message });
        }
    }

    /**
     * Menghapus mentor dari sistem
     * @route DELETE /api/mentors/:id
     */
    static async deleteMentor(req, res) {
        try {
            const { id } = req.params;
            const result = await MentorService.deleteMentor(id);

            return res.status(200).json({
                success: true,
                message: result.message
            });
        } catch (error) {
            if (error.message === 'Mentor tidak ditemukan.') {
                return res.status(404).json({ success: false, message: error.message });
            }
            return res.status(500).json({ success: false, error: error.message });
        }
    }
}

export default MentorController;