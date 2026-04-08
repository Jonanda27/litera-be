'use strict';
import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class Mentor extends Model {
    static associate(models) {
      // Relasi One-to-Many: Satu Mentor mendampingi banyak User
      this.hasMany(models.User, { foreignKey: 'mentor_id', as: 'students' });
    }
  }
  Mentor.init({
    nama: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    spesialisasi: DataTypes.STRING,
    kuota_peserta: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Mentor',
  });
  return Mentor;
};