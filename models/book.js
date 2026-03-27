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
    category: {
      type: DataTypes.STRING,
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    // --- TAMBAHKAN pdf_url DI SINI ---
    pdf_url: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // ---------------------------------
    coverFront: {
      type: DataTypes.TEXT('long'), 
      allowNull: true
    },
    coverBack: {
      type: DataTypes.TEXT('long'),
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Book',
    tableName: 'Books', 
  });

  return Book;
};