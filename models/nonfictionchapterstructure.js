'use strict';
import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class NonFictionChapterStructure extends Model {
    static associate(models) {
      this.belongsTo(models.Book, { foreignKey: 'bookId' });
    }
  }
  NonFictionChapterStructure.init({
    bookId: { type: DataTypes.INTEGER, allowNull: false },
    chapterNumber: DataTypes.STRING,
    title: { type: DataTypes.STRING, allowNull: false },
    hook: DataTypes.TEXT,
    learningPoints: { type: DataTypes.JSONB, defaultValue: [] },
    subChapters: { type: DataTypes.JSONB, defaultValue: [] },
    summaryPoints: { type: DataTypes.JSONB, defaultValue: [] },
    reflections: { type: DataTypes.JSONB, defaultValue: [] },
    actions: { type: DataTypes.JSONB, defaultValue: [] },
    nextPreview: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'NonFictionChapterStructure',
    tableName: 'NonFictionChapterStructures',
  });
  return NonFictionChapterStructure;
};