'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    // Menambahkan kolom coverFront untuk menyimpan string base64
    await queryInterface.addColumn('Books', 'coverFront', {
      type: Sequelize.TEXT('long'),
      allowNull: true
    });

    // Menambahkan kolom coverBack untuk menyimpan string base64
    await queryInterface.addColumn('Books', 'coverBack', {
      type: Sequelize.TEXT('long'),
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    // Menghapus kolom jika migration di-rollback
    await queryInterface.removeColumn('Books', 'coverFront');
    await queryInterface.removeColumn('Books', 'coverBack');
  }
};