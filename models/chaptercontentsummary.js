'use strict';
import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class ChapterContentSummary extends Model {
    static associate(models) {
      // Menghubungkan ke tabel Book 
      this.belongsTo(models.Book, { foreignKey: 'bookId' });
    }
  }
  ChapterContentSummary.init({
    bookId: DataTypes.INTEGER,
    chapterNumber: DataTypes.STRING,
    content: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'ChapterContentSummary',
    tableName: 'ChapterContentSummaries',
  });
  return ChapterContentSummary;
};