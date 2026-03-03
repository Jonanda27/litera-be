'use strict';
import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class User extends Model {
    static associate(models) {
      // User didampingi oleh Mentor
      this.belongsTo(models.Mentor, { foreignKey: 'mentor_id', as: 'mentor' });
      
      // User memiliki banyak Proyek
      this.hasMany(models.Project, { foreignKey: 'user_id' });
      
      // User memiliki catatan progres
      this.hasMany(models.UserProgress, { foreignKey: 'user_id' });

      // --- TAMBAHAN RELASI BARU ---
      // User memiliki banyak Buku
      this.hasMany(models.Book, { 
        foreignKey: 'userId', // Sesuaikan dengan nama kolom di migration Book
        as: 'books' 
      });
    }
  }

  User.init({
    nama: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    level_saat_ini: DataTypes.STRING,
    persentase_progres: { type: DataTypes.FLOAT, defaultValue: 0 }
  }, {
    sequelize,
    modelName: 'User',
  });

  return User;
};