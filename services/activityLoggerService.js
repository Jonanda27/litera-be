// Gunakan import db agar model ActivityLog terinisialisasi dengan benar
import db from '../models/index.js';

// Ambil model dari objek db
const { ActivityLog } = db;

/**
 * ActivityLoggerService
 * Bertanggung jawab sebagai sistem perantara untuk mencatat jejak aktivitas.
 */
class ActivityLoggerService {
    /**
     * Mengeksekusi pencatatan aktivitas.
     * @param {Object} payload
     */
    static async logActivity({ userId, action, resourceType, resourceId = null, details = {} }) {
        try {
            // Defensive programming
            if (!userId || !action || !resourceType) {
                console.warn('[ActivityLoggerService] Peringatan: userId, action, dan resourceType wajib diisi.');
                return null;
            }

            /**
             * PERBAIKAN: 
             * 1. Gunakan ActivityLog.create (bukan create saja)
             * 2. Sesuaikan nama properti dengan model (entityType & entityId)
             */
            const newLog = await ActivityLog.create({
                userId,
                action,
                entityType: resourceType, // Menyesuaikan dengan kolom di model kamu
                entityId: resourceId,     // Menyesuaikan dengan kolom di model kamu
                details
            });

            return newLog;

        } catch (error) {
            /**
             * STRATEGI FAIL-SAFE:
             * Jika logging gagal, aplikasi utama tidak boleh mati.
             */
            console.error('[ActivityLoggerService] Gagal merekam jejak aktivitas:', error.message);
            return null;
        }
    }
}

export default ActivityLoggerService;