'use strict';
import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class Book extends Model {
    static associate(models) {
      // Definisi relasi: Book dimiliki oleh User
      this.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user' 
      });

      // Anda juga bisa menambahkan relasi ke model lain di sini jika diperlukan,
      // contohnya ke Chapter:
      // this.hasMany(models.Chapter, { foreignKey: 'bookId', as: 'chapters' });
    }
  }

  Book.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
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