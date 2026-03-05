// migrations/XXXXXXXXXXXXXX-create-review-comment.js
'use strict';
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Review_Comments', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      chapterId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Chapters', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      highlight_id: { type: Sequelize.STRING, allowNull: false }, // ID unik untuk scrollToHighlight (ex: highlight-17123)
      selected_text: { type: Sequelize.TEXT, allowNull: false }, // Teks yang ditandai
      comment_text: { type: Sequelize.TEXT }, // Catatan tambahan (jika ada)
      label: { 
        type: Sequelize.ENUM('Cek Fakta', 'Tambah Deskripsi', 'Plot Hole', 'Typo/Ejaan'),
        defaultValue: 'Cek Fakta'
      },
      status: { 
        type: Sequelize.ENUM('open', 'done'), 
        defaultValue: 'open' 
      },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
  },
  async down(queryInterface, Sequelize) { await queryInterface.dropTable('Review_Comments'); }
};