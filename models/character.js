// models/character.js
'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Character extends Model {
    static associate(models) {
      this.belongsTo(models.Book, { foreignKey: 'bookId' });
    }
  }
  Character.init({
    bookId: DataTypes.INTEGER,
    fullName: DataTypes.STRING,
    nickname: DataTypes.STRING,
    role: DataTypes.STRING,
    imageUrl: DataTypes.TEXT,
    age: DataTypes.STRING,
    dob: DataTypes.STRING,
    gender: DataTypes.STRING,
    job: DataTypes.STRING,
    address: DataTypes.STRING,
    status: DataTypes.STRING,
    height: DataTypes.STRING,
    hair: DataTypes.STRING,
    eyes: DataTypes.STRING,
    physicalTrait: DataTypes.STRING,
    clothing: DataTypes.STRING,
    goodTraits: DataTypes.JSONB,
    badTraits: DataTypes.JSONB,
    fear: DataTypes.STRING,
    dream: DataTypes.STRING,
    habit: DataTypes.STRING,
    speakingStyle: DataTypes.STRING,
    past: DataTypes.TEXT,
    turningPoint: DataTypes.TEXT,
    relationships: DataTypes.JSONB,
    arcStart: DataTypes.TEXT,
    arcEnd: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Character',
    tableName: 'Characters'
  });
  return Character;
};