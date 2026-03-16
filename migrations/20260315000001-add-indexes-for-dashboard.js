'use strict';

export default {
    async up(queryInterface, Sequelize) {
        // 1. Index untuk Users (role)
        try {
            await queryInterface.addIndex('Users', ['role'], {
                name: 'idx_users_role'
            });
            console.log('✅ Index idx_users_role berhasil dibuat.');
        } catch (error) {
            console.log('⏩ Index idx_users_role sudah ada, dilewati...');
        }

        // 2. Index untuk User_Progress (status_selesai, updatedAt)
        try {
            await queryInterface.addIndex('User_Progress', ['status_selesai', 'updatedAt'], {
                name: 'idx_user_progress_status_updated'
            });
            console.log('✅ Index idx_user_progress_status_updated berhasil dibuat.');
        } catch (error) {
            console.log('⏩ Index idx_user_progress_status_updated sudah ada, dilewati...');
        }

        // 3. Index untuk Users (persentase_progres)
        try {
            await queryInterface.addIndex('Users', ['persentase_progres'], {
                name: 'idx_users_persentase_progres'
            });
            console.log('✅ Index idx_users_persentase_progres berhasil dibuat.');
        } catch (error) {
            console.log('⏩ Index idx_users_persentase_progres sudah ada, dilewati...');
        }
    },

    async down(queryInterface, Sequelize) {
        try { await queryInterface.removeIndex('Users', 'idx_users_role'); } catch(e) {}
        try { await queryInterface.removeIndex('User_Progress', 'idx_user_progress_status_updated'); } catch(e) {}
        try { await queryInterface.removeIndex('Users', 'idx_users_persentase_progres'); } catch(e) {}
    }
};