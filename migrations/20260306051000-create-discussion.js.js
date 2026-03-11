'use strict';
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Discussions', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      name: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT },
      meeting_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Meetings',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
  },
  async down(queryInterface, Sequelize) {
    // Tambahkan opsi cascade untuk memaksa penghapusan rujukan
    await queryInterface.dropTable('Discussions', { cascade: true });
  }
};