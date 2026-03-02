'use strict';
import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class Level extends Model {
    static associate(models) {
      // Relasi One-to-Many: Satu Level punya banyak Modul
      this.hasMany(models.Module, { foreignKey: 'level_id' });
    }
  }
  Level.init({
    nama_level: { type: DataTypes.STRING, allowNull: false },
    deskripsi: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Level',
  });
  return Level;
};