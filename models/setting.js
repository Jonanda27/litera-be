'use strict';
import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class Setting extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Relasi: Setting dimiliki oleh sebuah Book
      this.belongsTo(models.Book, {
        foreignKey: 'bookId',
        as: 'book'
      });
    }
  }

  Setting.init({
    location_name: {
      type: DataTypes.STRING,
      allowNull: false // Sesuai kebutuhan nama lokasi [cite: 380, 461]
    },
    description_ambiance: {
      type: DataTypes.TEXT // Deskripsi suasana [cite: 381, 461]
    },
    history_relation: {
      type: DataTypes.TEXT // Sejarah/hubungan lokasi [cite: 381, 461]
    },
    resident_characters: {
      type: DataTypes.TEXT // Karakter yang tinggal di sana [cite: 381, 461]
    },
    // Menghubungkan setting ke buku tertentu sesuai migrasi 
    bookId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Books',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'Setting',
    tableName: 'Settings', // Memastikan sinkron dengan nama tabel di database 
  });

  return Setting;
};