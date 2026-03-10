'use strict';
/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('MoodBoards', {
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
          model: 'Books', // Mengacu pada tabel Books [cite: 488, 543]
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      // --- FIELD BARU SESUAI FORM PAPAN VISI ---
      board_title: {
        type: Sequelize.STRING, // Judul Papan 
        allowNull: false
      },
      content_type: {
        type: Sequelize.ENUM('Upload Gambar', 'Link URL', 'Warna / Palet'),
        defaultValue: 'Upload Gambar'
      },
      image_url: {
        type: Sequelize.TEXT // Menyimpan URL gambar atau path file upload [cite: 163, 488]
      },
      visual_description: {
        type: Sequelize.TEXT // Deskripsi Visual
      },
      connection_to: {
        type: Sequelize.JSONB, // Menyimpan relasi ke Karakter, Lokasi, Bab, atau Suasana
        defaultValue: {}
      },
      dominant_color: {
        type: Sequelize.STRING // Warna Dominan (Hex Code)
      },
      // ------------------------------------------
      category: {
        type: Sequelize.STRING // Kategori umum (opsional) [cite: 489]
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
    await queryInterface.dropTable('MoodBoards'); // [cite: 490]
  }
};