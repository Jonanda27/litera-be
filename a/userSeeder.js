'use strict';
import bcrypt from 'bcryptjs';

export default {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    // Ambil ID mentor pertama untuk relasi
    const mentors = await queryInterface.sequelize.query(`SELECT id from "Mentors" LIMIT 1;`);
    const mentorId = mentors[0][0].id;

    await queryInterface.bulkInsert('Users', [{
      nama: 'Test User Geocitra',
      email: 'test@geocitra.com',
      password: hashedPassword,
      mentor_id: mentorId,
      level_saat_ini: 'Basic',
      persentase_progres: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', null, {});
  }
};