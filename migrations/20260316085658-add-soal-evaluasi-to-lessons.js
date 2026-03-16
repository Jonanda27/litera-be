'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    // Menambahkan kolom soal_evaluasi ke tabel Lessons
    // Tipe JSONB sangat cocok untuk menyimpan array object pertanyaan dan pilihan jawaban
    await queryInterface.addColumn('Lessons', 'soal_evaluasi', {
      type: Sequelize.JSONB,
      allowNull: true,
      defaultValue: [] // Default array kosong
    });
  },

  async down(queryInterface, Sequelize) {
    // Menghapus kolom jika migrasi di-rollback
    await queryInterface.removeColumn('Lessons', 'soal_evaluasi');
  }
};