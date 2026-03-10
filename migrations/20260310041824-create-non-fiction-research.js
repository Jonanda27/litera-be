'use strict';
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('NonFictionResearches', {
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
      tempTitle: { type: Sequelize.STRING },
      mainTopic: { type: Sequelize.TEXT },
      readerProblem: { type: Sequelize.TEXT },
      bookSolution: { type: Sequelize.TEXT },
      nicheLevel: { type: Sequelize.STRING },
      specificNiche: { type: Sequelize.TEXT },
      usp: { type: Sequelize.TEXT },
      // Field untuk object bersarang
      targetLogic: {
        type: Sequelize.JSONB,
        defaultValue: { want: "", obstacle: "", need: "" }
      },
      oneSentenceSummary: {
        type: Sequelize.JSONB,
        defaultValue: { target: "", duration: "" }
      },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('NonFictionResearches');
  }
};