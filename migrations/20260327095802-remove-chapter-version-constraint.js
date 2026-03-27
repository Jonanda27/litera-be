'use strict';

export default {
  async up(queryInterface, Sequelize) {
    // Menghapus constraint agar chapterId bisa menampung ID dari Non-Fiksi maupun Fiksi
    try {
      await queryInterface.removeConstraint('Chapter_Versions', 'Chapter_Versions_chapterId_fkey');
      console.log('✅ Constraint Chapter_Versions dihapus.');
    } catch (error) {
      console.log('⏩ Constraint tidak ditemukan, dilewati...');
    }
  },

  async down(queryInterface, Sequelize) {
    // Mengembalikan constraint ke tabel Chapters (Fiksi) jika rollback
    await queryInterface.addConstraint('Chapter_Versions', {
      fields: ['chapterId'],
      type: 'foreign key',
      name: 'Chapter_Versions_chapterId_fkey',
      references: {
        model: 'Chapters',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  }
};