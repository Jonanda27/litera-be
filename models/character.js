'use strict';
import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class Character extends Model {
    static associate(models) {
      // Relasi: Character dimiliki oleh sebuah Book
      this.belongsTo(models.Book, {
        foreignKey: 'bookId',
        as: 'book'
      });
    }
  }

  Character.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    age: DataTypes.STRING,
    physical_desc: DataTypes.TEXT,
    personality_backstory: DataTypes.TEXT,
    image_url: DataTypes.STRING,
    bookId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Character',
  });

  return Character;
};