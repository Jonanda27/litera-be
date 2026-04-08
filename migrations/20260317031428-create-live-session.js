'use strict';
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('LiveSessions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.STRING
      },
      speaker_name: {
        type: Sequelize.STRING
      },
      poster_url: {
        type: Sequelize.STRING
      },
      scheduled_at: {
        type: Sequelize.DATE
      },
      recording_url: {
        type: Sequelize.STRING
      },
      room_name: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.STRING
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
    await queryInterface.dropTable('LiveSessions');
  }
};