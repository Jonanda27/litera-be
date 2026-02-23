'use strict';
import bcrypt from 'bcryptjs'; // Menggunakan import sebagai pengganti require

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash('password123', salt);

    await queryInterface.bulkInsert('Users', [
      {
        email: 'admin@litera.com',
        password: hashPassword,
        role: 'administrator',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'mentor@litera.com',
        password: hashPassword,
        role: 'mentor',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'peserta@litera.com',
        password: hashPassword,
        role: 'peserta',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    // Menghapus data berdasarkan email tertentu agar lebih aman (tidak menghapus semua user)
    await queryInterface.bulkDelete('Users', {
      email: ['admin@litera.com', 'mentor@litera.com', 'peserta@litera.com']
    }, {});
  }
};