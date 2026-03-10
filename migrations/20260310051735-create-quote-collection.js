'use strict';
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('QuoteCollections', {
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
      text: { type: Sequelize.TEXT, allowNull: false },
      sourceType: { type: Sequelize.STRING },
      sourceDetail: { type: Sequelize.STRING },
      tags: { 
        type: Sequelize.JSONB, 
        defaultValue: ["", "", ""] 
      },
      relatedChapter: { type: Sequelize.STRING },
      chapterTitle: { type: Sequelize.STRING },
      context: { type: Sequelize.TEXT },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('QuoteCollections');
  }
};