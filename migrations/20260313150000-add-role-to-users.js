'use strict';

/**
 * Fase 1: Penambahan atribut role untuk membedakan hak akses Admin dan Peserta
 * @type {import('sequelize-cli').Migration} 
 */
export default {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('Users', 'role', {
            type: Sequelize.ENUM('admin', 'peserta'),
            allowNull: false,
            defaultValue: 'peserta'
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('Users', 'role');

        // Opsional: Pembersihan tipe ENUM jika Anda menggunakan PostgreSQL di masa depan
        // await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Users_role";').catch(() => {});
    }
};