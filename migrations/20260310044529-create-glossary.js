'use strict';
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Glossaries', {
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
      term: { type: Sequelize.STRING, allowNull: false },
      category: { type: Sequelize.STRING },
      shortDef: { type: Sequelize.TEXT },
      fullDef: { type: Sequelize.TEXT },
      example: { type: Sequelize.STRING },
      bab: { type: Sequelize.STRING },
      hal: { type: Sequelize.STRING },
      relatedTerms: { 
        type: Sequelize.JSONB, 
        defaultValue: [] 
      },
      needsDiagram: { 
        type: Sequelize.BOOLEAN, 
        defaultValue: false 
      },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Glossaries');
  }
};