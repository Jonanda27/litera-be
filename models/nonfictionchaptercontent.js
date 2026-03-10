'use strict';
import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class NonFictionChapterContent extends Model {
    static associate(models) {
      this.belongsTo(models.Book, { foreignKey: 'bookId' });
    }
  }
  NonFictionChapterContent.init({
    bookId: DataTypes.INTEGER,
    chapterNumber: DataTypes.STRING,
    content: DataTypes.TEXT,
    wordCount: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'NonFictionChapterContent',
    tableName: 'NonFictionChapterContents',
  });
  return NonFictionChapterContent;
};