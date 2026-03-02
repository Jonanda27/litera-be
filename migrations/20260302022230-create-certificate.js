// migrations/XXXXXXXXXXXXXX-create-certificate.js
'use strict';
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Certificates', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      module_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Modules', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      nomor_sertifikat: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
      },
      tanggal_terbit: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      url_file: {
        type: Sequelize.STRING // Link ke file PDF sertifikat
      },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Certificates');
  }
};