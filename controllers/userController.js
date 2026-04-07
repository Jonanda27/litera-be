import UserService from '../services/userService.js';
import ActivityLoggerService from '../services/activityLoggerService.js';
import MentorService from '../services/mentorService.js';

class UserController {
    /**
     * Mengambil daftar pengguna. Mendukung filter via query string (?role=peserta)
     * @route GET /api/users
     */
    static async getAllUsers(req, res) {
        try {
            const { role, mentor_id } = req.query;
            const filters = {};
            if (role) filters.role = role;
            if (mentor_id) filters.mentor_id = mentor_id;

            let users = [];
            let mentors = [];

            // Fetch data berdasarkan filter role
            if (!role) {
                [users, mentors] = await Promise.all([
                    UserService.getAllUsers(filters),
                    MentorService.getAllMentors()
                ]);
            } else if (role === 'mentor') {
                mentors = await MentorService.getAllMentors();
            } else {
                users = await UserService.getAllUsers(filters);
            }

            // Normalisasi User: Tambahkan prefiks 'u-' untuk key React
            const formattedUsers = users.map(u => {
                const plain = typeof u.toJSON === 'function' ? u.toJSON() : u;
                return { 
                    ...plain, 
                    originalId: plain.id, // ID asli untuk database
                    id: `u-${plain.id}`    // ID unik untuk frontend
                };
            });

            // Normalisasi Mentor: Tambahkan prefiks 'm-' dan role virtual
            const formattedMentors = mentors.map(m => {
                const plain = typeof m.toJSON === 'function' ? m.toJSON() : m;
                return { 
                    ...plain, 
                    originalId: plain.id, 
                    id: `m-${plain.id}`, 
                    role: 'mentor' 
                };
            });

            return res.status(200).json({
                success: true,
                message: 'Data akun berhasil diambil.',
                data: [...formattedUsers, ...formattedMentors]
            });
        } catch (error) {
            return res.status(500).json({ success: false, error: error.message });
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
            const { role } = req.body;
            let newData;

            // Logika Percabangan Tabel
            if (role === 'mentor') {
                // Jika role mentor, gunakan MentorService untuk simpan ke tabel Mentors
                // MentorService.createMentor menerima { email, password, nama, spesialisasi, kuota_peserta }
                newData = await MentorService.createMentor({
                    ...req.body,
                    nama: req.body.nama, // Mapping jika field di body berbeda
                    spesialisasi: req.body.spesialisasi || "Umum"
                });
            } else {
                // Jika role peserta atau admin, simpan ke tabel Users via UserService
                newData = await UserService.createUser(req.body);
            }

            // [INJEKSI LOG] 
            await ActivityLoggerService.logActivity({
                userId: req.user?.id || 'SYSTEM',
                action: 'CREATE',
                resourceType: role === 'mentor' ? 'Mentor' : 'User',
                resourceId: newData.id,
                details: { role: role, email: newData.email, spesialisasi: req.body.spesialisasi }
            });

            return res.status(201).json({
                success: true,
                message: `${role === 'mentor' ? 'Mentor' : 'Pengguna'} berhasil didaftarkan.`,
                data: newData
            });
        } catch (error) {
            const badRequestMessages = [
                'Email sudah terdaftar dalam sistem.',
                'Email sudah terdaftar sebagai Mentor.',
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

            // [INJEKSI LOG] Pencatatan aktivitas pembaruan pengguna
            await ActivityLoggerService.logActivity({
                userId: req.user?.id || 'SYSTEM',
                action: 'UPDATE',
                resourceType: 'User',
                resourceId: id,
                details: { updatedFields: Object.keys(req.body) } // Mencatat field apa saja yang diubah
            });

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

            // [INJEKSI LOG] Pencatatan aktivitas penghapusan pengguna
            await ActivityLoggerService.logActivity({
                userId: req.user?.id || 'SYSTEM',
                action: 'DELETE',
                resourceType: 'User',
                resourceId: id
            });

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