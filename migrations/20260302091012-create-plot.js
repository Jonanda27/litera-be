// migrations/XXXXXXXXXXXXXX-create-plot.js
'use strict';
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Plots', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      bookId: { 
        type: Sequelize.INTEGER, 
        allowNull: false, 
        references: { model: 'Books', key: 'id' }, 
        onUpdate: 'CASCADE', onDelete: 'CASCADE' 
      },
      title: { type: Sequelize.STRING, allowNull: false },
      act: { 
        type: Sequelize.ENUM('Babak 1: Pengenalan', 'Babak 2: Konflik Meningkat', 'Babak 3: Klimaks', 'Babak 4: Resolusi'),
        defaultValue: 'Babak 1: Pengenalan'
      },
      chapterNum: { type: Sequelize.STRING },
      sequenceNum: { type: Sequelize.STRING },
      location: { type: Sequelize.STRING },
      time: { type: Sequelize.STRING },
      characters: { type: Sequelize.TEXT }, // Nama-nama karakter terlibat
      summary: { type: Sequelize.TEXT },
      conflict: { type: Sequelize.TEXT },
      sceneFunction: { type: Sequelize.STRING }, // 'function' adalah reserved word di JS, gunakan sceneFunction
      prevScene: { type: Sequelize.STRING },
      nextScene: { type: Sequelize.STRING },
      status: { 
        type: Sequelize.ENUM('Ide', 'Draft', 'Selesai'),
        defaultValue: 'Ide'
      },
      labelColor: { type: Sequelize.STRING, defaultValue: '#f43f5e' },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Plots');
  }
};