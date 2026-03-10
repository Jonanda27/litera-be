// migrations/20260302081954-create-outline.js
'use strict';
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Outlines', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      bookId: { 
        type: Sequelize.INTEGER, 
        allowNull: false, 
        references: { model: 'Books', key: 'id' }, 
        onUpdate: 'CASCADE', onDelete: 'CASCADE' 
      },
      chapter_number: { type: Sequelize.STRING },
      title: { type: Sequelize.STRING, allowNull: false },
      pov: { type: Sequelize.STRING, defaultValue: 'Orang ketiga (Dia)' },
      location: { type: Sequelize.STRING },
      time_setting: { type: Sequelize.STRING },
      // Menggunakan JSONB untuk menyimpan array sub-chapters 
      sub_chapters: { type: Sequelize.JSONB, defaultValue: [] },
      notes: { type: Sequelize.TEXT },
      status: { 
        type: Sequelize.ENUM('Ide', 'Outline', 'Draft', 'Revisi', 'Selesai'),
        defaultValue: 'Outline' 
      },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Outlines');
  }
};