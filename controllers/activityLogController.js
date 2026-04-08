// File: controllers/activityLogController.js
import { ActivityLog } from '../models/index.js';
import { Op } from 'sequelize';

class ActivityLogController {
    /**
     * Mengambil daftar log aktivitas dengan dukungan filter dan pagination.
     * Dikhususkan untuk antarmuka Admin.
     * @route GET /api/activity-logs
     */
    static async getLogs(req, res) {
        try {
            // 1. Ekstraksi Query Parameters untuk Pagination
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const offset = (page - 1) * limit;

            // 2. Ekstraksi Query Parameters untuk Filtering
            const { userId, action, resourceType, startDate, endDate } = req.query;
            const whereCondition = {};

            // Filter berdasarkan Aktor
            if (userId) {
                whereCondition.userId = userId;
            }

            // Filter berdasarkan Jenis Aksi (Misal: LOGIN, CREATE, DELETE)
            if (action) {
                whereCondition.action = action;
            }

            // Filter berdasarkan Entitas yang dimanipulasi
            if (resourceType) {
                whereCondition.resourceType = resourceType;
            }

            // Filter berdasarkan Rentang Tanggal (Date Range)
            if (startDate || endDate) {
                whereCondition.createdAt = {};
                // Menggunakan operator >= untuk startDate
                if (startDate) {
                    whereCondition.createdAt[Op.gte] = new Date(startDate);
                }
                // Menggunakan operator <= untuk endDate (bisa diset ke jam 23:59:59 jika perlu detail)
                if (endDate) {
                    const end = new Date(endDate);
                    end.setHours(23, 59, 59, 999);
                    whereCondition.createdAt[Op.lte] = end;
                }
            }

            // 3. Eksekusi Query ke Database (Information Expert)
            // Menggunakan findAndCountAll sangat krusial untuk pagination di Frontend
            const { count, rows } = await ActivityLog.findAndCountAll({
                where: whereCondition,
                limit: limit,
                offset: offset,
                order: [['createdAt', 'DESC']], // Default: Data terbaru di atas
                // Jika ingin join dengan tabel User untuk menampilkan nama Aktor, bisa di-uncomment:
                // include: [{ model: User, attributes: ['id', 'nama', 'email'] }]
            });

            // 4. Kalkulasi Metadata Pagination
            const totalPages = Math.ceil(count / limit);

            return res.status(200).json({
                success: true,
                message: 'Data log aktivitas berhasil diambil.',
                data: rows,
                meta: {
                    totalItems: count,
                    itemsPerPage: limit,
                    currentPage: page,
                    totalPages: totalPages,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                }
            });

        } catch (error) {
            console.error('[ActivityLogController] Error fetching logs:', error);
            return res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan saat mengambil data log.',
                error: error.message
            });
        }
    }
}

export default ActivityLogController;