// File: services/activityLoggerService.js
import { create } from './models/ActivityLog'; // Sesuaikan dengan path model Anda

/**
 * ActivityLoggerService
 * * Bertanggung jawab penuh sebagai sistem perantara (Indirection) untuk 
 * mencatat jejak aktivitas. Pemisahan ini memastikan bahwa jika ke depannya
 * mekanisme logging berubah (misalnya pindah dari Database ke Message Broker seperti RabbitMQ/Kafka),
 * kita hanya perlu mengubah kelas ini tanpa menyentuh Controller (Protected Variations).
 */
class ActivityLoggerService {
    /**
     * Mengeksekusi pencatatan aktivitas.
     * * @param {Object} payload
     * @param {string} payload.userId - ID pengguna yang memicu aktivitas.
     * @param {string} payload.action - Jenis operasi (contoh: 'CREATE', 'UPDATE', 'DELETE', 'APPROVE').
     * @param {string} payload.resourceType - Nama entitas target (contoh: 'Transaction', 'User').
     * @param {string|null} [payload.resourceId] - ID spesifik entitas target (opsional).
     * @param {Object} [payload.details] - Data tambahan atau snapshot perubahan (opsional).
     * @returns {Promise<Object|null>} Mengembalikan instance log atau null jika gagal.
     */
    static async logActivity({ userId, action, resourceType, resourceId = null, details = {} }) {
        try {
            // Defensive programming: pastikan parameter absolut terpenuhi
            if (!userId || !action || !resourceType) {
                console.warn('[ActivityLoggerService] Peringatan: userId, action, dan resourceType wajib diisi. Logging dilewati.');
                return null;
            }

            const newLog = await create({
                userId,
                action,
                resourceType,
                resourceId,
                details
                // createdAt biasanya otomatis di-handle oleh timestamps (Mongoose/Sequelize)
            });

            return newLog;

        } catch (error) {
            /* * STRATEGI ERROR HANDLING:
             * Logging biasanya adalah "Side Effect". Jika database log mengalami gangguan, 
             * proses bisnis utama (misal: Checkout Barang) TIDAK BOLEH ikut gagal.
             * Oleh karena itu, kita menangkap error di sini dan mengembalikannya sebagai null,
             * hanya mencatatnya di level system error (bisa diarahkan ke Winston/Sentry).
             */
            console.error('[ActivityLoggerService] Gagal merekam jejak aktivitas:', error.message);

            // Catatan Analis: Jika requirement sistem mewajibkan "Strict Audit" (Transaksi gagal jika log gagal),
            // baris throw error di bawah ini harus diaktifkan. Untuk sekarang, kita buat Fail-Safe.
            // throw new Error('System Audit Failure');

            return null;
        }
    }
}

export default ActivityLoggerService;