'use strict';
import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class QuoteCollection extends Model {
    static associate(models) {
      this.belongsTo(models.Book, { foreignKey: 'bookId' });
    }
  }
  QuoteCollection.init({
    bookId: { type: DataTypes.INTEGER, allowNull: false },
    text: { type: DataTypes.TEXT, allowNull: false },
    sourceType: DataTypes.STRING,
    sourceDetail: DataTypes.STRING,
    tags: { type: DataTypes.JSONB, defaultValue: ["", "", ""] },
    relatedChapter: DataTypes.STRING,
    chapterTitle: DataTypes.STRING,
    context: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'QuoteCollection',
    tableName: 'QuoteCollections',
  });
  return QuoteCollection;
};