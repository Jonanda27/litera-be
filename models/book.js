'use strict';
import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class Book extends Model {
    static associate(models) {
      this.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user' 
      });
    }
  }

  Book.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // --- TAMBAHKAN INI ---
    category: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // ---------------------
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Book',
  });

  return Book;
};