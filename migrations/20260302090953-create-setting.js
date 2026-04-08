// migrations/XXXXXXXXXXXXXX-create-setting.js
'use strict';
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Settings', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      bookId: { 
        type: Sequelize.INTEGER, 
        allowNull: false, 
        references: { model: 'Books', key: 'id' }, 
        onUpdate: 'CASCADE', onDelete: 'CASCADE' 
      },
      name: { type: Sequelize.STRING, allowNull: false },
      type: { type: Sequelize.STRING },
      physicalDesc: { type: Sequelize.TEXT },
      atmosphere: { type: Sequelize.STRING },
      weather: { type: Sequelize.STRING },
      history: { type: Sequelize.TEXT },
      residents: { type: Sequelize.STRING },
      language: { type: Sequelize.STRING },
      rules: { type: Sequelize.TEXT },
      // Field berstruktur kompleks
      scenes: { type: Sequelize.JSONB, defaultValue: [] },
      relatedCharacters: { type: Sequelize.JSONB, defaultValue: [] },
      connection: { type: Sequelize.JSONB, defaultValue: {} },
      imageUrl: { type: Sequelize.TEXT }, // Gunakan TEXT untuk menyimpan string Base64 yang panjang
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Settings');
  }
};