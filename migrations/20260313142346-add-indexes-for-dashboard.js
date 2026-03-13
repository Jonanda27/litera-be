'use strict';

/** * Fase 5: Optimasi Basis Data untuk Kebutuhan Dasbor
 * Analisa: Mengubah Full Table Scan menjadi Index Scan/Index Only Scan
 * @type {import('sequelize-cli').Migration} 
 */
module.exports = {
    async up(queryInterface, Sequelize) {
        /**
         * 1. Optimasi Agregasi Total Peserta & Total Mentor
         * Tabel: Users | Kolom: role
         * Alasan: Query `SELECT COUNT(*) FROM Users WHERE role = 'peserta'` akan 
         * menggunakan index ini. Meskipun kardinalitas `role` rendah, index ini
         * sangat berguna jika RDBMS menggunakan teknik Bitmap Scan atau jika
         * digabungkan dengan kondisi lain (misalnya status aktif).
         */
        await queryInterface.addIndex('Users', ['role'], {
            name: 'idx_users_role',
            concurrently: true // Mencegah table lock saat pembuatan index di production (jika didukung RDBMS)
        });

        /**
         * 2. Optimasi Timeline Log Aktivitas Terkini
         * Tabel: ActivityLogs | Kolom: createdAt
         * Alasan: Query dasbor selalu membutuhkan `ORDER BY createdAt DESC LIMIT X`.
         * Tanpa index, DB harus mensortir seluruh tabel di memory (filesort).
         * Dengan index B-Tree, DB hanya membaca ujung dari tree.
         */
        await queryInterface.addIndex('ActivityLogs', ['createdAt'], {
            name: 'idx_activity_logs_created_at'
        });

        /**
         * 3. Optimasi Agregasi Modul Diselesaikan
         * Tabel: ModuleActivities | Kolom: status (Composite dengan updatedAt)
         * Alasan: Dasbor mencari `COUNT(*) WHERE status = 'selesai'`. 
         * Index komposit disiapkan jika nantinya kita butuh filter waktu penyelesaian
         * (misal: Modul diselesaikan bulan ini).
         */
        await queryInterface.addIndex('ModuleActivities', ['status', 'updatedAt'], {
            name: 'idx_module_activities_status_updated'
        });

        /**
         * 4. Optimasi Evaluasi Progres Pembelajaran
         * Tabel: UserProgress | Kolom: progress_percentage
         * Alasan: Mempercepat kalkulasi rata-rata (AVG) progres sistem secara keseluruhan.
         */
        await queryInterface.addIndex('UserProgress', ['progressPercentage'], {
            name: 'idx_user_progress_percentage'
        });
    },

    async down(queryInterface, Sequelize) {
        // Fase Rollback: Memastikan struktur dapat dikembalikan ke state semula secara bersih
        await queryInterface.removeIndex('Users', 'idx_users_role');
        await queryInterface.removeIndex('ActivityLogs', 'idx_activity_logs_created_at');
        await queryInterface.removeIndex('ModuleActivities', 'idx_module_activities_status_updated');
        await queryInterface.removeIndex('UserProgress', 'idx_user_progress_percentage');
    }
};