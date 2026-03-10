'use strict';
/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Researches', {
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
          model: 'Books', // Mengacu pada tabel Books [cite: 493]
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      // --- FIELD DARI FORM SIMPAN RISET ---
      source_title: {
        type: Sequelize.STRING, // Judul Materi [cite: 493]
        allowNull: false
      },
      source_type: {
        type: Sequelize.ENUM('Artikel Online', 'Buku', 'Video YouTube', 'Podcast', 'Catatan Pribadi', 'Wawancara'),
        defaultValue: 'Artikel Online'
      },
      link_url: {
        type: Sequelize.TEXT // Link/Referensi [cite: 494]
      },
      file_path: {
        type: Sequelize.STRING // Upload File (menyimpan path/url file)
      },
      topics: {
        type: Sequelize.STRING // Topik/Tag (disimpan sebagai string dipisah koma)
      },
      important_quote: {
        type: Sequelize.TEXT // Kutipan Penting
      },
      reference_point: {
        type: Sequelize.STRING // Halaman/Waktu
      },
      credibility: {
        type: Sequelize.INTEGER, // Kredibilitas (bintang 1-5)
        defaultValue: 0
      },
      usage_plan: {
        type: Sequelize.TEXT // Rencana Digunakan
      },
      // ------------------------------------
      notes: {
        type: Sequelize.TEXT // Catatan tambahan [cite: 494]
      },
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
    await queryInterface.dropTable('Researches'); 
  }
};