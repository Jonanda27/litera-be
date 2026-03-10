'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class QuickIdea extends Model {
    static associate(models) {
      // Relasi: Ide cepat dimiliki oleh sebuah Buku [cite: 672]
      this.belongsTo(models.Book, { foreignKey: 'bookId' });
    }
  }

  QuickIdea.init({
    bookId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    date: {
      type: DataTypes.DATE, // Menyimpan gabungan Tanggal dan Waktu [cite: 230, 310]
    },
    category_tag: {
      type: DataTypes.STRING, // Mapping dari 'category' di frontend [cite: 231]
    },
    description: {
      type: DataTypes.TEXT
    },
    mood: {
      type: DataTypes.STRING
    },
    reference: {
      type: DataTypes.STRING
    },
    priority: {
      type: DataTypes.ENUM('Segera', 'Nanti', 'Arsip'),
      defaultValue: 'Segera'
    }
  }, {
    sequelize,
    modelName: 'QuickIdea',
    tableName: 'QuickIdeas', // Pastikan nama tabel jamak dan sinkron dengan migrasi
  });

  return QuickIdea;
};