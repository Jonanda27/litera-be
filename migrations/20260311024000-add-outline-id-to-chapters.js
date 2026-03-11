'use strict';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Chapters', 'outlineId', {
      type: Sequelize.INTEGER,
      allowNull: true, // Ubah ke false jika semua bab wajib terhubung ke outline
      references: {
        model: 'Outlines',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Chapters', 'outlineId');
  }
};