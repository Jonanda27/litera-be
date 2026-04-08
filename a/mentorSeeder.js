'use strict';
import bcrypt from 'bcryptjs';

export default {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash('password123', 10);
    await queryInterface.bulkInsert('Mentors', [{
      nama: 'Mentor Geocitra',
      email: 'mentor@geocitra.com',
      password: hashedPassword,
      spesialisasi: 'Fullstack Developer',
      kuota_peserta: 10,
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Mentors', null, {});
  }
};