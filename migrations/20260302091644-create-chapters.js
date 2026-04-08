'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Chapters', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      bookId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Books',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      content: {
        type: Sequelize.TEXT,
        defaultValue: ''
      },
      // --- TAMBAHKAN KOLOM PAGE DI SINI ---
      page: {
        type: Sequelize.INTEGER,
        allowNull: true // Sesuaikan menjadi false jika wajib diisi
      },
      // ------------------------------------
      word_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      daily_target: {
        type: Sequelize.INTEGER,
        defaultValue: 1000
      },
      is_safe: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      order_index: {
        type: Sequelize.INTEGER,
        defaultValue: 0
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
    await queryInterface.dropTable('Chapters');
  }
};