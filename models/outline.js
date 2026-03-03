'use strict';
import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class Outline extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Relasi: Outline dimiliki oleh sebuah Book
      this.belongsTo(models.Book, {
        foreignKey: 'bookId',
        as: 'book'
      });
    }
  }

  Outline.init({
    // Menghubungkan outline ke buku tertentu 
    bookId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Books',
        key: 'id'
      }
    },
    chapter_number: {
      type: DataTypes.INTEGER
    },
    title: {
      type: DataTypes.STRING
    },
    summary: {
      type: DataTypes.TEXT
    },
    // Digunakan untuk urutan drag-and-drop bab [cite: 372]
    order_index: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'Outline',
    tableName: 'Outlines', // Sesuai dengan nama tabel di migrasi [cite: 370]
  });

  return Outline;
};