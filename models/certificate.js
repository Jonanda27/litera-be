// models/certificate.js
'use strict';
import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class Certificate extends Model {
    static associate(models) {
      this.belongsTo(models.User, { foreignKey: 'user_id' });
      this.belongsTo(models.Module, { foreignKey: 'module_id' });
    }
  }
  Certificate.init({
    user_id: DataTypes.INTEGER,
    module_id: DataTypes.INTEGER,
    nomor_sertifikat: DataTypes.STRING,
    tanggal_terbit: DataTypes.DATE,
    url_file: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Certificate',
  });
  return Certificate;
};