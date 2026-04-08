'use strict';
import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class Project extends Model {
    static associate(models) {
      this.belongsTo(models.User, { foreignKey: 'user_id' });
    }
  }
  Project.init({
    judul_buku: DataTypes.STRING,
    deskripsi: DataTypes.TEXT,
    kendala: DataTypes.TEXT,
    status: DataTypes.STRING,
    update_terakhir: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Project',
  });
  return Project;
};