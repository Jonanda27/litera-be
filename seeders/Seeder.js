'use strict';
import bcrypt from 'bcryptjs';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash('password123', 10);
    const now = new Date();

    // 1. Seed Mentors
    await queryInterface.bulkInsert('Mentors', [{
      nama: 'Prabawa Subiyanta',
      email: 'mentor3@geocitra.com',
      password: hashedPassword,
      spesialisasi: 'Literasi & Menulis',
      kuota_peserta: 50,
      createdAt: now,
      updatedAt: now
    }], {});

    const [mentors] = await queryInterface.sequelize.query('SELECT id FROM "Mentors" LIMIT 1;');
    const mentorId = mentors[0].id;

    // 2. Seed Levels
    await queryInterface.bulkInsert('Levels', [{
      nama_level: 'Level 1: Dasar-Dasar Literasi',
      deskripsi: 'Tahap awal pengembangan kemampuan membaca dan menulis sehat.',
      createdAt: now,
      updatedAt: now
    }], {});

    const [levels] = await queryInterface.sequelize.query('SELECT id FROM "Levels" LIMIT 1;');
    const levelId = levels[0].id;

    // 3. Seed Modules
    await queryInterface.bulkInsert('Modules', [
      {
        level_id: levelId,
        nama_modul: 'Level-1/Modul-1',
        createdAt: now,
        updatedAt: now
      },
      {
        level_id: levelId,
        nama_modul: 'Level-1/Modul-2',
        createdAt: now,
        updatedAt: now
      }
    ], {});

    // Ambil ID untuk Modul 1 dan Modul 2
    const [mod1] = await queryInterface.sequelize.query('SELECT id FROM "Modules" WHERE "nama_modul" = \'Level-1/Modul-1\' LIMIT 1;');
    const [mod2] = await queryInterface.sequelize.query('SELECT id FROM "Modules" WHERE "nama_modul" = \'Level-1/Modul-2\' LIMIT 1;');
    
    const moduleId1 = mod1[0].id;
    const moduleId2 = mod2[0].id;

    // 4. Seed Lessons untuk Modul 1 (11 Materi)
    await queryInterface.bulkInsert('Lessons', [
      { module_id: moduleId1, tipe_konten: 'bacaan', judul_materi: 'Membaca Sehat 1', url_konten: 'https://example.com/pdf1', createdAt: now, updatedAt: now },
      { module_id: moduleId1, tipe_konten: 'video', judul_materi: 'Menulis Sehat 1', url_konten: 'https://youtube.com/watch?v=1', createdAt: now, updatedAt: now },
      { module_id: moduleId1, tipe_konten: 'bacaan', judul_materi: 'Membaca Sehat 2', url_konten: 'https://example.com/pdf2', createdAt: now, updatedAt: now },
      { module_id: moduleId1, tipe_konten: 'video', judul_materi: 'Menulis Sehat 2', url_konten: 'https://youtube.com/watch?v=2', createdAt: now, updatedAt: now },
      { module_id: moduleId1, tipe_konten: 'bacaan', judul_materi: 'Membaca Sehat 3', url_konten: 'https://example.com/pdf3', createdAt: now, updatedAt: now },
      { module_id: moduleId1, tipe_konten: 'video', judul_materi: 'Menulis Sehat 3', url_konten: 'https://youtube.com/watch?v=3', createdAt: now, updatedAt: now },
      { module_id: moduleId1, tipe_konten: 'bacaan', judul_materi: 'Membaca Sehat 4', url_konten: 'https://example.com/pdf4', createdAt: now, updatedAt: now },
      { module_id: moduleId1, tipe_konten: 'video', judul_materi: 'Menulis Sehat 4', url_konten: 'https://youtube.com/watch?v=4', createdAt: now, updatedAt: now },
      { module_id: moduleId1, tipe_konten: 'bacaan', judul_materi: 'Membaca Sehat 5', url_konten: 'https://example.com/pdf5', createdAt: now, updatedAt: now },
      { module_id: moduleId1, tipe_konten: 'video', judul_materi: 'Menulis Sehat 5', url_konten: 'https://youtube.com/watch?v=5', createdAt: now, updatedAt: now },
      { module_id: moduleId1, tipe_konten: 'bacaan', judul_materi: 'Evaluasi Membaca 1', url_konten: 'https://example.com/pdf6', createdAt: now, updatedAt: now }
    ], {});

    // 5. Seed Lessons untuk Modul 2 (11 Materi)
    await queryInterface.bulkInsert('Lessons', [
      { module_id: moduleId2, tipe_konten: 'bacaan', judul_materi: 'Analisis Kritis 1', url_konten: 'https://example.com/mod2-pdf1', createdAt: now, updatedAt: now },
      { module_id: moduleId2, tipe_konten: 'video', judul_materi: 'Struktur Opini 1', url_konten: 'https://youtube.com/watch?v=m2-1', createdAt: now, updatedAt: now },
      { module_id: moduleId2, tipe_konten: 'bacaan', judul_materi: 'Analisis Kritis 2', url_konten: 'https://example.com/mod2-pdf2', createdAt: now, updatedAt: now },
      { module_id: moduleId2, tipe_konten: 'video', judul_materi: 'Struktur Opini 2', url_konten: 'https://youtube.com/watch?v=m2-2', createdAt: now, updatedAt: now },
      { module_id: moduleId2, tipe_konten: 'bacaan', judul_materi: 'Analisis Kritis 3', url_konten: 'https://example.com/mod2-pdf3', createdAt: now, updatedAt: now },
      { module_id: moduleId2, tipe_konten: 'video', judul_materi: 'Struktur Opini 3', url_konten: 'https://youtube.com/watch?v=m2-3', createdAt: now, updatedAt: now },
      { module_id: moduleId2, tipe_konten: 'bacaan', judul_materi: 'Analisis Kritis 4', url_konten: 'https://example.com/mod2-pdf4', createdAt: now, updatedAt: now },
      { module_id: moduleId2, tipe_konten: 'video', judul_materi: 'Struktur Opini 4', url_konten: 'https://youtube.com/watch?v=m2-4', createdAt: now, updatedAt: now },
      { module_id: moduleId2, tipe_konten: 'bacaan', judul_materi: 'Analisis Kritis 5', url_konten: 'https://example.com/mod2-pdf5', createdAt: now, updatedAt: now },
      { module_id: moduleId2, tipe_konten: 'video', judul_materi: 'Struktur Opini 5', url_konten: 'https://youtube.com/watch?v=m2-5', createdAt: now, updatedAt: now },
      { module_id: moduleId2, tipe_konten: 'bacaan', judul_materi: 'Evaluasi Modul 2', url_konten: 'https://example.com/mod2-pdf6', createdAt: now, updatedAt: now }
    ], {});

    // 6. Seed Users
    await queryInterface.bulkInsert('Users', [{
      nama: 'Jonanda Pantas',
      email: 'test3@geocitra.com',
      password: hashedPassword,
      mentor_id: mentorId,
      level_saat_ini: 'Level 1: Dasar-Dasar Literasi',
      persentase_progres: 0,
      createdAt: now,
      updatedAt: now
    }], {});

    // --- TAMBAHAN SEEDER SERTIFIKAT ---
    // 7. Seed Certificates
    const [users] = await queryInterface.sequelize.query('SELECT id FROM "Users" WHERE "email" = \'test@geocitra.com\' LIMIT 1;');
    const userId = users[0].id;

    await queryInterface.bulkInsert('Certificates', [
      {
        user_id: userId,
        module_id: moduleId1,
        nomor_sertifikat: `CERT/L1M1/${userId}/${Date.now()}`,
        tanggal_terbit: now,
        url_file: 'https://storage.com/sertifikat/l1-m1.pdf',
        createdAt: now,
        updatedAt: now
      },
      {
        user_id: userId,
        module_id: moduleId2,
        nomor_sertifikat: `CERT/L1M2/${userId}/${Date.now() + 1}`,
        tanggal_terbit: now,
        url_file: 'https://storage.com/sertifikat/l1-m2.pdf',
        createdAt: now,
        updatedAt: now
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Certificates', null, {}); // Hapus sertifikat dulu karena ada relation
    await queryInterface.bulkDelete('Lessons', null, {});
    await queryInterface.bulkDelete('Modules', null, {});
    await queryInterface.bulkDelete('Users', null, {});
    await queryInterface.bulkDelete('Levels', null, {});
    await queryInterface.bulkDelete('Mentors', null, {});
  }
};