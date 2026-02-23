'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     */
    static associate(models) {
      // definisikan relasi di sini jika ada (contoh: User.hasMany(models.Post))
    }
  }

  User.init({
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('peserta', 'mentor', 'administrator'),
      defaultValue: 'peserta',
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'Users', // Pastikan sesuai dengan nama tabel di migration
  });

  return User;
};