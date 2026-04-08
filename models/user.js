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

      this.hasMany(models.Transaction, { foreignKey: 'user_id' });

      /**
       * PENTING: Relasi User ke Book dihapus dari sini karena sudah 
       * didefinisikan secara eksplisit di models/index.js.
       * Mendefinisikannya di sini lagi akan menyebabkan Error Association (Alias Duplicated).
       */
    }
  }

  User.init({
    nama: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    no_hp: { type: DataTypes.STRING, allowNull: true },
    level_saat_ini: DataTypes.STRING,
    persentase_progres: { type: DataTypes.FLOAT, defaultValue: 0 },
    // Penambahan atribut role sebagai resolusi entitas Admin
    role: {
      type: DataTypes.ENUM('admin', 'peserta', 'mentor'), // Tambahkan 'mentor' di sini
      allowNull: false,
      defaultValue: 'peserta'
    },
    status: { type: DataTypes.STRING, defaultValue: 'Non-Aktif' }
  }, {
    sequelize,
    modelName: 'User',
  });

  return User;
};
