'use strict';
import { Model } from 'sequelize';
export default (sequelize, DataTypes) => {
  class ChapterVersion extends Model {
    static associate(models) {
      this.belongsTo(models.Chapter, { foreignKey: 'chapterId' });
    }
  }
  ChapterVersion.init({
    chapterId: DataTypes.INTEGER,
    version_name: DataTypes.STRING,
    content: DataTypes.TEXT,
    word_count: DataTypes.INTEGER
  }, { sequelize, modelName: 'ChapterVersion', tableName: 'Chapter_Versions' });
  return ChapterVersion;
};