'use strict';
/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('QuickIdeas', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      bookId: {
  type: Sequelize.INTEGER,
  references: {
    model: 'Books', // Pastikan kamu sudah punya tabel Books
    key: 'id'
  },
  onUpdate: 'CASCADE',
  onDelete: 'CASCADE'
},
      title: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.TEXT
      },
      category_tag: {
        type: Sequelize.STRING
      },
      date: {
        type: Sequelize.DATE
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('QuickIdeas');
  }
};