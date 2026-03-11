'use strict';
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ChapterContentSummaries', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      bookId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Books', key: 'id' }, // Relasi ke tabel Books [cite: 1716, 1718]
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      chapterNumber: {
        type: Sequelize.STRING, // Mengambil data chapter_number dari Outlines [cite: 1737]
        allowNull: false
      },
      content: {
        type: Sequelize.TEXT, // Mengambil data content dari Chapters [cite: 1761]
        defaultValue: ''
      },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ChapterContentSummaries');
  }
};