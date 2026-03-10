'use strict';
import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class MoodBoard extends Model {
    static associate(models) {
      // MoodBoard dimiliki oleh sebuah Book [cite: 589, 617]
      this.belongsTo(models.Book, {
        foreignKey: 'bookId',
        as: 'book'
      });
    }
  }

  MoodBoard.init({
    bookId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Books', // [cite: 618]
        key: 'id'
      }
    },
    // --- FIELD BARU ---
    board_title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    content_type: {
      type: DataTypes.ENUM('Upload Gambar', 'Link URL', 'Warna / Palet'),
      defaultValue: 'Upload Gambar'
    },
    image_url: {
      type: DataTypes.TEXT // [cite: 618]
    },
    visual_description: {
      type: DataTypes.TEXT
    },
    connection_to: {
      type: DataTypes.JSONB, // Menyimpan data JSON seperti { "karakter": "Alya", "lokasi": "Istana" }
      defaultValue: {}
    },
    dominant_color: {
      type: DataTypes.STRING
    },
    // ------------------
    category: {
      type: DataTypes.STRING // [cite: 618]
    }
  }, {
    sequelize,
    modelName: 'MoodBoard',
    tableName: 'MoodBoards', // [cite: 619]
  });

  return MoodBoard;
};