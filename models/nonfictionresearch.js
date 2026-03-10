'use strict';
import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class NonFictionResearch extends Model {
    static associate(models) {
      this.belongsTo(models.Book, { foreignKey: 'bookId' });
    }
  }
  NonFictionResearch.init({
    bookId: { type: DataTypes.INTEGER, allowNull: false },
    tempTitle: DataTypes.STRING,
    mainTopic: DataTypes.TEXT,
    readerProblem: DataTypes.TEXT,
    bookSolution: DataTypes.TEXT,
    nicheLevel: DataTypes.STRING,
    specificNiche: DataTypes.TEXT,
    usp: DataTypes.TEXT,
    targetLogic: DataTypes.JSONB,
    oneSentenceSummary: DataTypes.JSONB,
  }, {
    sequelize,
    modelName: 'NonFictionResearch',
    tableName: 'NonFictionResearches',
  });
  return NonFictionResearch;
};