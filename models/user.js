'use strict';
import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class User extends Model {
    static associate(models) {
      // User didampingi oleh Mentor [cite: 370]
      this.belongsTo(models.Mentor, { foreignKey: 'mentor_id', as: 'mentor' });

      // User memiliki banyak Proyek [cite: 371]
      this.hasMany(models.Project, { foreignKey: 'user_id' });

      // User memiliki catatan progres [cite: 372]
      this.hasMany(models.UserProgress, { foreignKey: 'user_id' });

      /**
       * PENTING: Relasi User ke Book dihapus dari sini karena sudah 
       * didefinisikan secara eksplisit di models/index.js.
       * Mendefinisikannya di sini lagi akan menyebabkan Error Association (Alias Duplicated).
       */
    }
  }

  User.init({
    nama: { type: DataTypes.STRING, allowNull: false }, // [cite: 373]
    email: { type: DataTypes.STRING, unique: true, allowNull: false }, // [cite: 373]
    password: { type: DataTypes.STRING, allowNull: false }, // [cite: 373]
    level_saat_ini: DataTypes.STRING, // [cite: 373]
    persentase_progres: { type: DataTypes.FLOAT, defaultValue: 0 } // [cite: 373]
  }, {
    sequelize,
    modelName: 'User',
  });

  return User;
};