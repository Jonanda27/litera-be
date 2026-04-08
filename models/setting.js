// models/setting.js
'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Setting extends Model {
    static associate(models) {
      this.belongsTo(models.Book, { foreignKey: 'bookId', as: 'book' });
    }
  }
  Setting.init({
    bookId: DataTypes.INTEGER,
    name: DataTypes.STRING,
    type: DataTypes.STRING,
    physicalDesc: DataTypes.TEXT,
    atmosphere: DataTypes.STRING,
    weather: DataTypes.STRING,
    history: DataTypes.TEXT,
    residents: DataTypes.STRING,
    language: DataTypes.STRING,
    rules: DataTypes.TEXT,
    scenes: DataTypes.JSONB,
    relatedCharacters: DataTypes.JSONB,
    connection: DataTypes.JSONB,
    imageUrl: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Setting',
    tableName: 'Settings'
  });
  return Setting;
};