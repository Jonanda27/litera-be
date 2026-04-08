'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class DailyWordCount extends Model {
    static associate(models) {
      this.belongsTo(models.Book, { foreignKey: 'bookId' });
    }
  }

  DailyWordCount.init({
    bookId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    word_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    date: {
      type: DataTypes.DATEONLY,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'DailyWordCount',
    tableName: 'Daily_Word_Counts',
  });

  return DailyWordCount;
};