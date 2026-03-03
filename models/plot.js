'use strict';
import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class Plot extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Menghubungkan Plot ke sebuah Book 
      this.belongsTo(models.Book, { 
        foreignKey: 'bookId', 
        as: 'book' 
      });
    }
  }

  Plot.init({
    act: {
      type: DataTypes.STRING, // Misal: "Babak I" [cite: 389]
    },
    tag: {
      type: DataTypes.STRING, // Misal: "Aksi", "Konflik" [cite: 389]
    },
    title: {
      type: DataTypes.STRING
    },
    description: {
      type: DataTypes.TEXT
    },
    order_index: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    bookId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Plot',
    tableName: 'Plots', // Memastikan sinkron dengan nama tabel di migrasi 
  });

  return Plot;
}