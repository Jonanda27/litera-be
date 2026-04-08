'use strict';

/**
 * @type {import('sequelize-cli').Migration} 
 */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'status', {
      type: Sequelize.STRING,
      defaultValue: 'Non-Aktif'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'status');

    // Opsional: Pembersihan tipe ENUM jika Anda menggunakan PostgreSQL di masa depan
    // await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Users_role";').catch(() => {});
  }
};
