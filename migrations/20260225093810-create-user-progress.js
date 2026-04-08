'use strict';

/** @type {import('sequelize-cli').Migration} */
// Gunakan export default, bukan module.exports
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('User_Progress', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      // WAJIB: Tambahkan module_id untuk mendukung progres per modul
      module_id: { 
        type: Sequelize.INTEGER,
        references: { model: 'Modules', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      lesson_id: {
        type: Sequelize.INTEGER,
        references: { model: 'Lessons', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      status_selesai: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('User_Progress');
  }
};