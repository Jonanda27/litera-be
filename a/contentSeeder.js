'use strict';

export default {
  async up(queryInterface, Sequelize) {
    const levels = await queryInterface.sequelize.query(`SELECT id from "Levels" LIMIT 1;`);
    const levelId = levels[0][0].id;

    await queryInterface.bulkInsert('Modules', [{
      level_id: levelId,
      nama_modul: 'Pengenalan Literasi',
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Modules', null, {});
  }
};