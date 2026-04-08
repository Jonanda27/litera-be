'use strict';
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('NonFictionSources', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      bookId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Books', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      type: { type: Sequelize.STRING, defaultValue: 'Buku' },
      title: { type: Sequelize.STRING, allowNull: false },
      author: { type: Sequelize.STRING },
      year: { type: Sequelize.STRING },
      publisherUrl: { type: Sequelize.TEXT },
      isbnDoi: { type: Sequelize.STRING },
      relatedChapters: { 
        type: Sequelize.JSONB, 
        defaultValue: ["", "", ""] 
      },
      quotes: { type: Sequelize.TEXT },
      pageRef: { type: Sequelize.STRING },
      notes: { type: Sequelize.TEXT },
      credibility: { 
        type: Sequelize.ENUM('Tinggi', 'Sedang', 'Rendah'),
        defaultValue: 'Sedang'
      },
      citationStatus: { 
        type: Sequelize.ENUM('Belum dipake', 'Udah dipake', 'Buat referensi aja'),
        defaultValue: 'Belum dipake'
      },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('NonFictionSources');
  }
};