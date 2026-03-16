import db from '../models/index.js';
import bcrypt from 'bcrypt';
import MentorService from './mentorService.js';

// PERBAIKAN: Pastikan sequelize diambil dari objek db yang diekspor dari models/index.js
const { User, sequelize } = db;

class UserService {
    /**
     * Mengambil semua pengguna (bisa di-filter berdasarkan role)
     */
    static async getAllUsers(filters = {}) {
        return await User.findAll({
            where: filters,
            attributes: { exclude: ['password'] },
            include: [
                {
                    model: db.Mentor,
                    as: 'mentor',
                    attributes: ['id', 'nama', 'spesialisasi']
                }
            ]
        });
    }

    /**
     * Mengambil satu pengguna beserta detail mentornya
     */
    static async getUserById(id) {
        const user = await User.findByPk(id, {
            attributes: { exclude: ['password'] },
            include: ['mentor']
        });

        if (!user) {
            throw new Error('Pengguna tidak ditemukan.');
        }
        return user;
    }

    /**
     * Algoritma pembuatan akun dengan validasi relasional (Transactional)
     */
    static async createUser(data) {
        const { email, password, nama, role, mentor_id } = data;

        // 1. Validasi Unik
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            throw new Error('Email sudah terdaftar dalam sistem.');
        }

        // 2. Persiapan Hashing
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // 3. Memulai Transaksi Basis Data Terisolasi
        // PERBAIKAN: Memastikan sequelize tersedia sebelum memanggil transaction()
        if (!sequelize) {
            throw new Error('Database connection (sequelize) is not initialized in UserService.');
        }

        const transaction = await sequelize.transaction();

        try {
            // Jika user yang dibuat adalah peserta dan diawajibkan memilih mentor
            if (role === 'peserta' && mentor_id) {
                // Melakukan delegasi logika validasi kuota ke MentorService (High Cohesion)
                await MentorService.validateAndReserveQuota(mentor_id, transaction);
            }

            const newUser = await User.create({
                email,
                password: hashedPassword,
                nama,
                role: role || 'peserta', // Fallback otomatis ke peserta
                mentor_id: mentor_id || null,
                level_saat_ini: 'Pemula',
                persentase_progres: 0
            }, { transaction });

            // Commit jika semua tahapan mutasi data sukses
            await transaction.commit();

            // Hapus properti password dari objek kembalian
            const userResponse = newUser.toJSON();
            delete userResponse.password;

            return userResponse;

        } catch (error) {
            // Rollback mutasi jika terjadi kegagalan (misal: kuota habis saat concurrent request)
            if (transaction) await transaction.rollback();
            throw error;
        }
    }

    /**
     * Memperbarui entitas pengguna dan menangani pergantian mentor
     */
    static async updateUser(id, data) {
        if (!sequelize) {
            throw new Error('Database connection (sequelize) is not initialized in UserService.');
        }

        const transaction = await sequelize.transaction();

        try {
            const user = await User.findByPk(id, { transaction });
            if (!user) throw new Error('Pengguna tidak ditemukan.');

            const updateData = { ...data };

            // Penanganan khusus jika ada pembaruan kata sandi
            if (updateData.password && updateData.password.trim() !== "") {
                updateData.password = await bcrypt.hash(updateData.password, 10);
            } else {
                delete updateData.password; // Jangan update password jika kosong
            }

            // Penanganan rute logika jika peserta berganti mentor
            if (updateData.mentor_id && updateData.mentor_id !== user.mentor_id) {
                // 1. Kembalikan kuota mentor lama jika sebelumnya punya mentor
                if (user.mentor_id) {
                    await MentorService.releaseQuota(user.mentor_id, transaction);
                }
                // 2. Kurangi kuota mentor yang baru
                await MentorService.validateAndReserveQuota(updateData.mentor_id, transaction);
            }

            await user.update(updateData, { transaction });
            await transaction.commit();

            const updatedUser = await this.getUserById(id); // Ambil data segar tanpa password
            return updatedUser;

        } catch (error) {
            if (transaction) await transaction.rollback();
            throw error;
        }
    }

    /**
     * Menghapus pengguna (dan membersihkan reservasi kuota mentornya)
     */
    static async deleteUser(id) {
        if (!sequelize) {
            throw new Error('Database connection (sequelize) is not initialized in UserService.');
        }

        const transaction = await sequelize.transaction();

        try {
            const user = await User.findByPk(id, { transaction });
            if (!user) throw new Error('Pengguna tidak ditemukan.');

            if (user.mentor_id) {
                await MentorService.releaseQuota(user.mentor_id, transaction);
            }

            await user.destroy({ transaction });
            await transaction.commit();

            return { message: 'Pengguna berhasil dihapus dan relasi dibersihkan.' };
        } catch (error) {
            if (transaction) await transaction.rollback();
            throw error;
        }
    }
}

export default UserService;