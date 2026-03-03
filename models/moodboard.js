'use strict';
import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class MoodBoard extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Relasi: MoodBoard dimiliki oleh sebuah Book 
      this.belongsTo(models.Book, {
        foreignKey: 'bookId',
        as: 'book'
      });
    }
  }

  MoodBoard.init({
    // Menghubungkan moodboard ke buku tertentu 
    bookId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Books',
        key: 'id'
      }
    },
    image_url: {
      type: DataTypes.TEXT
    },
    category: {
      type: DataTypes.STRING
    }
  }, {
    sequelize,
    modelName: 'MoodBoard',
    tableName: 'MoodBoards', // Nama tabel sesuai migrasi [cite: 359]
  });

  return MoodBoard;
};