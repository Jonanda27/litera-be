import db from '../models/index.js';
import bcrypt from 'bcrypt';

const { Mentor } = db;

class MentorService {
    /**
     * Mengambil semua data mentor
     */
    static async getAllMentors() {
        return await Mentor.findAll({
            attributes: { exclude: ['password'] } // Menerapkan prinsip least privilege data
        });
    }

    /**
     * Mengambil data mentor berdasarkan ID spesifik
     */
    static async getMentorById(id) {
        const mentor = await Mentor.findByPk(id, {
            attributes: { exclude: ['password'] }
        });

        if (!mentor) {
            throw new Error('Mentor tidak ditemukan.');
        }
        return mentor;
    }

    /**
     * Membuat entitas Mentor baru dengan enkripsi kata sandi
     */
    static async createMentor(data) {
        const { email, password, nama, spesialisasi, kuota_peserta } = data;

        // Cek duplikasi email pada level aplikasi sebelum DB constraint memicu error
        const existingMentor = await Mentor.findOne({ where: { email } });
        if (existingMentor) {
            throw new Error('Email sudah terdaftar sebagai Mentor.');
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        return await Mentor.create({
            email,
            password: hashedPassword,
            nama,
            spesialisasi,
            kuota_peserta: kuota_peserta || 0 // Defensive programming untuk default value
        });
    }

    /**
     * Memperbarui data Mentor (termasuk penanganan update password secara opsional)
     */
    static async updateMentor(id, data) {
        const mentor = await this.getMentorById(id);
        const updateData = { ...data };

        if (updateData.password) {
            const saltRounds = 10;
            updateData.password = await bcrypt.hash(updateData.password, saltRounds);
        }

        return await mentor.update(updateData);
    }

    /**
     * Validasi dan reservasi kuota mentor. 
     * Dipanggil oleh UserService saat seorang peserta memilih mentor.
     */
    static async validateAndReserveQuota(mentorId, transaction = null) {
        const mentor = await Mentor.findByPk(mentorId, { transaction });

        if (!mentor) {
            throw new Error('Mentor yang dituju tidak valid.');
        }

        if (mentor.kuota_peserta <= 0) {
            throw new Error('Kapasitas kuota mentor ini sudah penuh.');
        }

        // Mengurangi kuota secara atomik
        await mentor.decrement('kuota_peserta', { by: 1, transaction });
        return mentor;
    }

    /**
     * Mengembalikan kuota saat peserta dihapus atau ganti mentor
     */
    static async releaseQuota(mentorId, transaction = null) {
        const mentor = await Mentor.findByPk(mentorId, { transaction });
        if (mentor) {
            await mentor.increment('kuota_peserta', { by: 1, transaction });
        }
    }

    /**
     * Menghapus mentor
     */
    static async deleteMentor(id) {
        const mentor = await this.getMentorById(id);
        await mentor.destroy();
        return { message: 'Mentor berhasil dihapus.' };
    }
}

export default MentorService;