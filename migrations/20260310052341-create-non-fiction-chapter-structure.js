'use strict';
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('NonFictionChapterStructures', {
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
      chapterNumber: { type: Sequelize.STRING },
      title: { type: Sequelize.STRING, allowNull: false },
      hook: { type: Sequelize.TEXT },
      // Menggunakan JSONB untuk array dan nested objects
      learningPoints: { 
        type: Sequelize.JSONB, 
        defaultValue: [] 
      },
      subChapters: { 
        type: Sequelize.JSONB, 
        defaultValue: [] 
      },
      summaryPoints: { 
        type: Sequelize.JSONB, 
        defaultValue: [] 
      },
      reflections: { 
        type: Sequelize.JSONB, 
        defaultValue: [] 
      },
      actions: { 
        type: Sequelize.JSONB, 
        defaultValue: [] 
      },
      nextPreview: { type: Sequelize.TEXT },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('NonFictionChapterStructures');
  }
};