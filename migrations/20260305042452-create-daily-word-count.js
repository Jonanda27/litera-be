'use strict';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Daily_Word_Counts', {
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
          model: 'Books', // Mengacu pada tabel Books [cite: 489]
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      word_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      date: {
        type: Sequelize.DATEONLY, // Hanya menyimpan YYYY-MM-DD
        defaultValue: Sequelize.NOW
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
    await queryInterface.dropTable('Daily_Word_Counts');
  }
};