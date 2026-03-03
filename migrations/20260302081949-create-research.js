'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Researches', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      // Menghubungkan riset ke buku tertentu
      bookId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Books', // Nama tabel induk
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      source_title: {
        type: Sequelize.STRING
      },
      link_url: {
        type: Sequelize.TEXT
      },
      notes: {
        type: Sequelize.TEXT
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now')
      }
    });
  },

  async down(queryInterface, Sequelize) {
    // Pastikan nama tabel di sini sama dengan yang di atas (Researches)
    await queryInterface.dropTable('Researches');
  }
};