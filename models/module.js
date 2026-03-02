'use strict';
import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class Module extends Model {
    static associate(models) {
      this.belongsTo(models.Level, { foreignKey: 'level_id' });
      this.hasMany(models.Lesson, { foreignKey: 'module_id' });
      this.hasMany(models.UserProgress, { foreignKey: 'module_id' });
  this.hasMany(models.Certificate, { foreignKey: 'module_id' });
    }
  }
  Module.init({
    nama_modul: { type: DataTypes.STRING, allowNull: false }
  }, {
    sequelize,
    modelName: 'Module',
  });
  return Module;
};