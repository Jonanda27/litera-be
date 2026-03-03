'use strict';
import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class Timeline extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Relasi: Timeline dimiliki oleh sebuah Book
      this.belongsTo(models.Book, {
        foreignKey: 'bookId',
        as: 'book'
      });
    }
  }

  Timeline.init({
    // Menghubungkan timeline ke buku tertentu sesuai migrasi 
    bookId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Books',
        key: 'id'
      }
    },
    time_date: {
      type: DataTypes.STRING // Format waktu/tanggal peristiwa 
    },
    event: {
      type: DataTypes.TEXT // Deskripsi peristiwa [cite: 384]
    },
    involved_characters: {
      type: DataTypes.TEXT // Karakter yang terlibat [cite: 384]
    }
  }, {
    sequelize,
    modelName: 'Timeline',
    tableName: 'Timelines', // Menyesuaikan dengan nama tabel di database [cite: 382]
  });

  return Timeline;
};