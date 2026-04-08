'use strict';
/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Timelines', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      bookId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Books',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      // --- FIELD DARI FORM GARIS WAKTU ---
      event_order: { 
        type: Sequelize.INTEGER // Kejadian ke- (urutan kronologis)
      },
      event_name: { 
        type: Sequelize.STRING, // Nama Peristiwa
        allowNull: false 
      },
      date_time: { 
        type: Sequelize.STRING // Tanggal atau Hari ke-
      },
      time_clock: { 
        type: Sequelize.STRING // Jam
      },
      duration: { 
        type: Sequelize.STRING // Durasi Kejadian
      },
      description: { 
        type: Sequelize.TEXT // Deskripsi Singkat
      },
      // Menggunakan JSONB untuk daftar nama karakter yang terlibat 
      involved_characters_list: { 
        type: Sequelize.JSONB, 
        defaultValue: [] 
      },
      location: { 
        type: Sequelize.STRING // Lokasi
      },
      related_chapters: { 
        type: Sequelize.STRING // Bab Terkait
      },
      consequence_of: { 
        type: Sequelize.TEXT // Akibat dari Peristiwa
      },
      leading_to: { 
        type: Sequelize.TEXT // Menyebabkan Peristiwa
      },
      importance_level: { 
        type: Sequelize.ENUM('Krusial', 'Biasa', 'Detail'),
        defaultValue: 'Biasa'
      },
      // -----------------------------------
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now')
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Timelines');
  }
};