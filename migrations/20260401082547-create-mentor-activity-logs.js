'use strict';
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('MentorActivityLogs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      mentor_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Mentors', key: 'id' }, // Pastikan nama tabel mentor Anda benar
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      action: {
        type: Sequelize.STRING, // Contoh: 'SEND_WA', 'VIEW_PROGRESS', 'LOGIN'
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      target_user_id: {
        type: Sequelize.INTEGER, // Opsional: ID siswa yang dipantau (jika ada)
        allowNull: true
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
    await queryInterface.dropTable('MentorActivityLogs');
  }
};