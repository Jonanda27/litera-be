'use strict';
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Settings', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      bookId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Books', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      location_name: { type: Sequelize.STRING },
      description_ambiance: { type: Sequelize.TEXT },
      history_relation: { type: Sequelize.TEXT },
      resident_characters: { type: Sequelize.TEXT },
      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('now') },
      updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('now') }
    });
  },
  async down(queryInterface, Sequelize) { await queryInterface.dropTable('Settings'); }
};