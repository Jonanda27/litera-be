'use strict';
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Characters', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      bookId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Books', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      name: { type: Sequelize.STRING },
      age: { type: Sequelize.STRING },
      physical_desc: { type: Sequelize.TEXT },
      personality_backstory: { type: Sequelize.TEXT },
      image_url: { type: Sequelize.STRING },
      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('now') },
      updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('now') }
    });
  },
  async down(queryInterface, Sequelize) { await queryInterface.dropTable('Characters'); }
};