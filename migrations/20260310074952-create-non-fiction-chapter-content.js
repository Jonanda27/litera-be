'use strict';
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('NonFictionChapterContents', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      bookId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Books', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      chapterNumber: {
        type: Sequelize.STRING, // Mengambil chapternumber dari structure
        allowNull: false
      },
      content: {
        type: Sequelize.TEXT,
        defaultValue: ''
      },
      wordCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('NonFictionChapterContents');
  }
};