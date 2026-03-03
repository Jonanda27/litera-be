'use strict';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Books', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false // Judul sebaiknya tidak boleh kosong
      },
      // Tambahkan userId di bawah ini
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users', // Nama tabel yang direferensikan (biasanya jamak)
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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
    await queryInterface.dropTable('Books');
  }
};