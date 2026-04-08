'use strict';
import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class Research extends Model {
    static associate(models) {
      // Relasi: Research dimiliki oleh sebuah Book [cite: 644]
      this.belongsTo(models.Book, {
        foreignKey: 'bookId',
        as: 'book'
      });
    }
  }

  Research.init({
    bookId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Books',
        key: 'id'
      }
    },
    // --- FIELD BARU ---
    source_title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    source_type: {
      type: DataTypes.ENUM('Artikel Online', 'Buku', 'Video YouTube', 'Podcast', 'Catatan Pribadi', 'Wawancara'),
      defaultValue: 'Artikel Online'
    },
    link_url: {
      type: DataTypes.TEXT
    },
    file_path: {
      type: DataTypes.STRING
    },
    topics: {
      type: DataTypes.STRING
    },
    important_quote: {
      type: DataTypes.TEXT
    },
    reference_point: {
      type: DataTypes.STRING
    },
    credibility: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 5
      }
    },
    usage_plan: {
      type: DataTypes.TEXT
    },
    // ------------------
    notes: {
      type: DataTypes.TEXT
    }
  }, {
    sequelize,
    modelName: 'Research',
    tableName: 'Researches', // Sinkron dengan nama tabel di database [cite: 646]
  });

  return Research;
};