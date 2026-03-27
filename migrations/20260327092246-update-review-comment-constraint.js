'use strict';

export default {
  async up(queryInterface, Sequelize) {
    /**
     * Langkah 1: Mencari dan menghapus Constraint Foreign Key yang lama.
     * Secara default Sequelize memberi nama 'Review_Comments_chapterId_fkey'.
     */
    try {
      await queryInterface.removeConstraint('Review_Comments', 'Review_Comments_chapterId_fkey');
      console.log('Foreign key constraint removed successfully.');
    } catch (error) {
      console.log('Constraint not found or already removed.');
    }

    /**
     * Langkah 2: Mengubah kolom label menjadi STRING biasa (opsional).
     * Ini dilakukan agar Anda bisa menambah kategori label baru di masa depan 
     * tanpa harus melakukan migrasi ENUM terus-menerus.
     */
    await queryInterface.changeColumn('Review_Comments', 'label', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: 'Cek Fakta'
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Kembalikan constraint ke tabel Chapters (Fiksi) jika migrasi di-rollback.
     */
    await queryInterface.addConstraint('Review_Comments', {
      fields: ['chapterId'],
      type: 'foreign key',
      name: 'Review_Comments_chapterId_fkey',
      references: {
        model: 'Chapters',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  }
};