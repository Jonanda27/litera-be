'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    /**
     * Menambahkan kolom no_hp ke tabel Users
     */
    await queryInterface.addColumn('Users', 'no_hp', {
      type: Sequelize.STRING,
      allowNull: true, // Diizinkan null agar data lama tidak error
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Menghapus kolom no_hp jika migrasi di-rollback
     */
    await queryInterface.removeColumn('Users', 'no_hp');
  }
};