'use strict';
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('NonFictionCaseStudies', {
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
      title: { type: Sequelize.STRING, allowNull: false },
      type: { type: Sequelize.STRING },
      background: { type: Sequelize.TEXT },
      chronology: { type: Sequelize.TEXT },
      problem: { type: Sequelize.TEXT },
      solution: { type: Sequelize.TEXT },
      result: { type: Sequelize.TEXT },
      lessons: { 
        type: Sequelize.JSONB, 
        defaultValue: ["", "", ""] 
      },
      relatedChapter: { type: Sequelize.STRING },
      relatedConcept: { type: Sequelize.STRING },
      corePrinciple: { type: Sequelize.STRING },
      publicationStatus: { type: Sequelize.STRING },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('NonFictionCaseStudies');
  }
};