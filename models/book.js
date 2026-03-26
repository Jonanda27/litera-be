'use strict';
import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class Book extends Model {
    static associate(models) {
      // Menghubungkan buku dengan user (author)
      this.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user' 
      });

      // Menambahkan kembali asosiasi lain jika ada di kode asli Anda
      // Contoh: this.hasMany(models.Outline, { foreignKey: 'bookId' });
    }
  }

  Book.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    // --- BAGIAN BARU: PENYIMPANAN COVER ---
    coverFront: {
      type: DataTypes.TEXT('long'), // Menggunakan TEXT('long') agar muat base64 yang besar
      allowNull: true
    },
    coverBack: {
      type: DataTypes.TEXT('long'),
      allowNull: true
    }
    // --------------------------------------
  }, {
    sequelize,
    modelName: 'Book',
    tableName: 'Books', // Memastikan tabel bernama 'Books' sesuai migration
  });

  return Book;
};