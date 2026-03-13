import UserService from '../services/userService.js';

class UserController {
    /**
     * Mengambil daftar pengguna. Mendukung filter via query string (?role=peserta)
     * @route GET /api/users
     */
    static async getAllUsers(req, res) {
        try {
            // Mengekstrak query parameter untuk delegasi filter ke tingkat ORM
            const filters = {};
            if (req.query.role) filters.role = req.query.role;
            if (req.query.mentor_id) filters.mentor_id = req.query.mentor_id;

            const users = await UserService.getAllUsers(filters);

            return res.status(200).json({
                success: true,
                message: 'Data pengguna berhasil diambil.',
                data: users
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
     * Mengambil detail spesifik pengguna (beserta relasi mentornya)
     * @route GET /api/users/:id
     */
    static async getUserById(req, res) {
        try {
            const { id } = req.params;
            const user = await UserService.getUserById(id);

            return res.status(200).json({
                success: true,
                message: 'Detail pengguna berhasil diambil.',
                data: user
            });
        } catch (error) {
            if (error.message === 'Pengguna tidak ditemukan.') {
                return res.status(404).json({ success: false, message: error.message });
            }
            return res.status(500).json({ success: false, error: error.message });
        }
    }

    /**
     * Membuat entitas pengguna baru (Admin atau Peserta)
     * @route POST /api/users
     */
    static async createUser(req, res) {
        try {
            const newUser = await UserService.createUser(req.body);

            return res.status(201).json({
                success: true,
                message: 'Pengguna berhasil didaftarkan.',
                data: newUser
            });
        } catch (error) {
            // Mapping eksepsi bisnis dari service layer ke status kode 400
            const badRequestMessages = [
                'Email sudah terdaftar dalam sistem.',
                'Mentor yang dituju tidak valid.',
                'Kapasitas kuota mentor ini sudah penuh.'
            ];

            if (badRequestMessages.includes(error.message)) {
                return res.status(400).json({ success: false, message: error.message });
            }

            return res.status(500).json({ success: false, error: error.message });
        }
    }

    /**
     * Memperbarui data pengguna, termasuk mutasi relasi mentor
     * @route PUT /api/users/:id
     */
    static async updateUser(req, res) {
        try {
            const { id } = req.params;
            const updatedUser = await UserService.updateUser(id, req.body);

            return res.status(200).json({
                success: true,
                message: 'Data pengguna berhasil diperbarui.',
                data: updatedUser
            });
        } catch (error) {
            if (error.message === 'Pengguna tidak ditemukan.') {
                return res.status(404).json({ success: false, message: error.message });
            }

            const badRequestMessages = ['Mentor yang dituju tidak valid.', 'Kapasitas kuota mentor ini sudah penuh.'];
            if (badRequestMessages.includes(error.message)) {
                return res.status(400).json({ success: false, message: error.message });
            }

            return res.status(500).json({ success: false, error: error.message });
        }
    }

    /**
     * Menghapus pengguna (sistem akan otomatis melepaskan reservasi kuota mentor)
     * @route DELETE /api/users/:id
     */
    static async deleteUser(req, res) {
        try {
            const { id } = req.params;
            const result = await UserService.deleteUser(id);

            return res.status(200).json({
                success: true,
                message: result.message
            });
        } catch (error) {
            if (error.message === 'Pengguna tidak ditemukan.') {
                return res.status(404).json({ success: false, message: error.message });
            }
            return res.status(500).json({ success: false, error: error.message });
        }
    }
}

export default UserController;