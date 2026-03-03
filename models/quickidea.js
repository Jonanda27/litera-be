'use strict';
import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class QuickIdea extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Relasi: QuickIdea dimiliki oleh sebuah Book [cite: 354, 452]
      this.belongsTo(models.Book, {
        foreignKey: 'bookId',
        as: 'book'
      });
    }
  }

  QuickIdea.init({
    // Menghubungkan Ide ke Buku tertentu 
    bookId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Books',
        key: 'id'
      }
    },
    title: {
      type: DataTypes.STRING
    },
    description: {
      type: DataTypes.TEXT
    },
    category_tag: {
      type: DataTypes.STRING
    },
    date: {
      type: DataTypes.DATE
    }
  }, {
    sequelize,
    modelName: 'QuickIdea',
    tableName: 'QuickIdeas', // Sesuai dengan nama tabel di migrasi [cite: 354]
  });

  return QuickIdea;
};