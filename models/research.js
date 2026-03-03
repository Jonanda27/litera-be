'use strict';
import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class Research extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Relasi: Research dimiliki oleh sebuah Book
      this.belongsTo(models.Book, {
        foreignKey: 'bookId',
        as: 'book'
      });
    }
  }

  Research.init({
    // Menghubungkan riset ke buku tertentu sesuai migrasi
    bookId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Books',
        key: 'id'
      }
    },
    source_title: {
      type: DataTypes.STRING
    },
    link_url: {
      type: DataTypes.TEXT
    },
    notes: {
      type: DataTypes.TEXT
    }
  }, {
    sequelize,
    modelName: 'Research',
    tableName: 'Researches', // Memastikan sinkron dengan nama tabel di database
  });

  return Research;
};