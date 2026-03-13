// migrations/20260315000000-create-activity-log.js
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('ActivityLogs', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4
            },
            userId: {
                type: Sequelize.UUID,
                allowNull: true, // Diizinkan null untuk mengakomodasi aksi sistem (contoh: Cron Job / Auto-expiry)
                references: {
                    model: 'Users', // Asumsi nama tabel pengguna di database Anda adalah 'Users'
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL' // Jika user dihapus, log aktivitasnya tetap ada sebagai sejarah (Audit Trail)
            },
            action: {
                type: Sequelize.STRING,
                allowNull: false
            },
            entityType: {
                type: Sequelize.STRING,
                allowNull: true // Bisa null untuk aksi global seperti 'LOGIN' atau 'LOGOUT'
            },
            entityId: {
                type: Sequelize.UUID,
                allowNull: true
            },
            details: {
                type: Sequelize.JSON, // Memanfaatkan tipe JSON untuk menyimpan snapshot data spesifik
                allowNull: true
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });

        // Analisa Performa: Menambahkan Index sangat krusial di sini.
        // Log Activity akan tumbuh sangat cepat. Tanpa index, query filter pada Dasbor Admin akan menyebabkan Table Scan yang berat.
        await queryInterface.addIndex('ActivityLogs', ['userId']);
        await queryInterface.addIndex('ActivityLogs', ['action']);
        await queryInterface.addIndex('ActivityLogs', ['createdAt']);
        await queryInterface.addIndex('ActivityLogs', ['entityType', 'entityId']); // Compound index untuk pencarian spesifik
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('ActivityLogs');
    }
};