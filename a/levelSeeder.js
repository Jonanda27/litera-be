'use strict';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Levels', [{
      nama_level: 'Basic',
      deskripsi: 'Level dasar untuk pemula',
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Levels', null, {});
  }
};