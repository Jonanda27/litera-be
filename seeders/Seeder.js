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
      email: 'mentor2@geocitra.com',
      password: hashedPassword,
      spesialisasi: 'Literasi & Menulis',
      kuota_peserta: 20,
      createdAt: now,
      updatedAt: now
    }], {});

    const [mentors] = await queryInterface.sequelize.query('SELECT id FROM "Mentors" LIMIT 1;');
    const mentorId = mentors[0].id;

    // 2. Seed Levels (3 Level)
    await queryInterface.bulkInsert('Levels', [
      { nama_level: 'Level 1: Dasar-Dasar Literasi', deskripsi: 'Tahap awal pengembangan kemampuan membaca dan menulis sehat.', createdAt: now, updatedAt: now },
      { nama_level: 'Level 2: Pengembangan Analisis', deskripsi: 'Mendalami teknik analisis teks dan struktur argumen.', createdAt: now, updatedAt: now },
      { nama_level: 'Level 3: Penulisan Kreatif & Publikasi', deskripsi: 'Persiapan karya untuk dipublikasikan secara luas.', createdAt: now, updatedAt: now }
    ], {});

    const [levelRows] = await queryInterface.sequelize.query('SELECT id FROM "Levels" ORDER BY id ASC;');
    const l1Id = levelRows[0].id;
    const l2Id = levelRows[1].id;
    const l3Id = levelRows[2].id;

    // 3. Seed Modules (Masing-masing level punya 5 modul)
    const modulesData = [];
    for (let i = 1; i <= 5; i++) modulesData.push({ level_id: l1Id, nama_modul: `Level-1/Modul-${i}`, createdAt: now, updatedAt: now });
    for (let i = 1; i <= 5; i++) modulesData.push({ level_id: l2Id, nama_modul: `Level-2/Modul-${i}`, createdAt: now, updatedAt: now });
    for (let i = 1; i <= 5; i++) modulesData.push({ level_id: l3Id, nama_modul: `Level-3/Modul-${i}`, createdAt: now, updatedAt: now });

    await queryInterface.bulkInsert('Modules', modulesData, {});

    // Ambil ID Modul untuk mapping Lessons
    const [moduleRows] = await queryInterface.sequelize.query('SELECT id, nama_modul FROM "Modules" ORDER BY id ASC;');
    const getModId = (name) => moduleRows.find(m => m.nama_modul === name).id;

    // Helper untuk membuat 11 lessons per modul
    const generate11Lessons = (modId, prefix) => {
      const lessons = [];
      for (let i = 1; i <= 10; i++) {
        lessons.push({
          module_id: modId,
          tipe_konten: i % 2 === 0 ? 'video' : 'bacaan',
          judul_materi: `${prefix} - Materi ${i}`,
          url_konten: i % 2 === 0 ? `https://youtube.com/watch?v=${modId}-${i}` : `https://example.com/pdf-${modId}-${i}`,
          createdAt: now,
          updatedAt: now
        });
      }
      // Lesson ke-11: Evaluasi
      lessons.push({
        module_id: modId,
        tipe_konten: 'evaluasi',
        judul_materi: `Evaluasi ${prefix}`,
        url_konten: `https://example.com/evaluasi-${modId}`,
        createdAt: now,
        updatedAt: now
      });
      return lessons;
    };

    // 4. Seed Lessons (Total 33 Lessons: Modul 1, 2, dan 3 masing-masing 11 materi)
    const allLessons = [
      ...generate11Lessons(getModId('Level-1/Modul-1'), 'Modul 1'),
      ...generate11Lessons(getModId('Level-1/Modul-2'), 'Modul 2'),
      ...generate11Lessons(getModId('Level-1/Modul-3'), 'Modul 3')
    ];

    await queryInterface.bulkInsert('Lessons', allLessons, {});

    // 5. Seed Users (Peserta & Admin)
    const targetEmail = 'test@geocitra.com';
    await queryInterface.bulkInsert('Users', [
      {
        nama: 'Geocitra',
        email: targetEmail,
        password: hashedPassword,
        mentor_id: mentorId,
        level_saat_ini: 'Level 1: Dasar-Dasar Literasi',
        persentase_progres: 0,
        role: 'peserta',
        createdAt: now,
        updatedAt: now
      },
      {
        nama: 'Admin Litera',
        email: 'admin@geocitra.com',
        password: hashedPassword,
        mentor_id: null,
        level_saat_ini: null,
        persentase_progres: 0,
        role: 'admin',
        createdAt: now,
        updatedAt: now
      }
    ], {});

    const [users] = await queryInterface.sequelize.query(`SELECT id FROM "Users" WHERE "email" = '${targetEmail}' LIMIT 1;`);
    const userId = users[0].id;

    // 6. Seed Certificates
    await queryInterface.bulkInsert('Certificates', [
      {
        user_id: userId,
        module_id: getModId('Level-1/Modul-1'),
        nomor_sertifikat: `CERT/L1M1/${userId}/${Date.now()}`,
        tanggal_terbit: now,
        url_file: 'https://storage.com/sertifikat/l1-m1.pdf',
        createdAt: now,
        updatedAt: now
      },
      {
        user_id: userId,
        module_id: getModId('Level-1/Modul-2'),
        nomor_sertifikat: `CERT/L1M2/${userId}/${Date.now() + 1}`,
        tanggal_terbit: now,
        url_file: 'https://storage.com/sertifikat/l1-m2.pdf',
        createdAt: now,
        updatedAt: now
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Certificates', null, {});
    await queryInterface.bulkDelete('Lessons', null, {});
    await queryInterface.bulkDelete('Modules', null, {});
    await queryInterface.bulkDelete('Users', null, {});
    await queryInterface.bulkDelete('Levels', null, {});
    await queryInterface.bulkDelete('Mentors', null, {});
  }
};