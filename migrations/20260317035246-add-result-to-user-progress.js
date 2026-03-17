'use strict';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('User_Progress', 'jawaban_user', {
      type: Sequelize.JSONB,
      allowNull: true
    });
    await queryInterface.addColumn('User_Progress', 'skor', {
      type: Sequelize.INTEGER,
      allowNull: true
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('User_Progress', 'jawaban_user');
    await queryInterface.removeColumn('User_Progress', 'skor');
  }
};