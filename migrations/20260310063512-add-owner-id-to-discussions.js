'use strict';
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Discussions', 'owner_id', {
      type: Sequelize.INTEGER,
      allowNull: true, // Ubah ke false jika semua diskusi lama harus punya pemilik
      references: {
        model: 'Users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Discussions', 'owner_id');
  }
};