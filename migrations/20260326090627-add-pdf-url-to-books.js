'use strict';

export default {
  async up(queryInterface, Sequelize) {
    /**
     * Menambahkan kolom pdf_url ke tabel Books
     */
    await queryInterface.addColumn('Books', 'pdf_url', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Menghapus kolom pdf_url jika migration dibatalkan (undo)
     */
    await queryInterface.removeColumn('Books', 'pdf_url');
  }
};