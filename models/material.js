'use strict';
import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class Material extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Menghubungkan Material ke sebuah Module [cite: 235]
      this.belongsTo(models.Module, { 
        foreignKey: 'module_id',
        as: 'module' 
      });
    }
  }

  Material.init({
    module_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    tipe: {
      type: DataTypes.STRING,
      allowNull: false
    },
    judul: {
      type: DataTypes.STRING,
      allowNull: false
    },
    order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'Material',
  });

  return Material;
};