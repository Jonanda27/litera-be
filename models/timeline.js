'use strict';
import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class Timeline extends Model {
    static associate(models) {
      // Relasi: Timeline dimiliki oleh sebuah Book [cite: 660]
      this.belongsTo(models.Book, {
        foreignKey: 'bookId',
        as: 'book'
      });
    }
  }

  Timeline.init({
    bookId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Books',
        key: 'id'
      }
    },
    // --- FIELD BARU ---
    event_order: DataTypes.INTEGER,
    event_name: { 
      type: DataTypes.STRING,
      allowNull: false 
    },
    date_time: DataTypes.STRING,
    time_clock: DataTypes.STRING,
    duration: DataTypes.STRING,
    description: DataTypes.TEXT,
    involved_characters_list: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    location: DataTypes.STRING,
    related_chapters: DataTypes.STRING,
    consequence_of: DataTypes.TEXT,
    leading_to: DataTypes.TEXT,
    importance_level: {
      type: DataTypes.ENUM('Krusial', 'Biasa', 'Detail'),
      defaultValue: 'Biasa'
    }
    // ------------------
  }, {
    sequelize,
    modelName: 'Timeline',
    tableName: 'Timelines', // Pastikan sesuai dengan migrasi [cite: 662]
  });

  return Timeline;
};