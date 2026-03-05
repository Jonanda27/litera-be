// migrations/XXXXXXXXXXXXXX-create-chapter-version.js
'use strict';
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Chapter_Versions', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      chapterId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Chapters', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      version_name: { type: Sequelize.STRING, allowNull: false }, // Contoh: "v.1", "Draf Final"
      content: { type: Sequelize.TEXT, allowNull: false },
      word_count: { type: Sequelize.INTEGER },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
  },
  async down(queryInterface, Sequelize) { await queryInterface.dropTable('Chapter_Versions'); }
};