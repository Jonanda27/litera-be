'use strict';
import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class NonFictionCaseStudy extends Model {
    static associate(models) {
      this.belongsTo(models.Book, { foreignKey: 'bookId' });
    }
  }
  NonFictionCaseStudy.init({
    bookId: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    type: DataTypes.STRING,
    background: DataTypes.TEXT,
    chronology: DataTypes.TEXT,
    problem: DataTypes.TEXT,
    solution: DataTypes.TEXT,
    result: DataTypes.TEXT,
    lessons: { type: DataTypes.JSONB, defaultValue: ["", "", ""] },
    relatedChapter: DataTypes.STRING,
    relatedConcept: DataTypes.STRING,
    corePrinciple: DataTypes.STRING,
    publicationStatus: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'NonFictionCaseStudy',
    tableName: 'NonFictionCaseStudies',
  });
  return NonFictionCaseStudy;
};