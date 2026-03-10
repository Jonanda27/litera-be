'use strict';
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('QuickIdeas', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      bookId: {
        type: Sequelize.INTEGER,
        references: { model: 'Books', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      title: { type: Sequelize.STRING, allowNull: false },
      date: { type: Sequelize.DATE },
      category_tag: { type: Sequelize.STRING },
      description: { type: Sequelize.TEXT },
      mood: { type: Sequelize.STRING },
      reference: { type: Sequelize.STRING },
      priority: { 
        // Menggunakan ENUM dengan nilai yang konsisten
        type: Sequelize.ENUM('Segera', 'Nanti', 'Arsip'),
        defaultValue: 'Segera'
      },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
  },

  async down(queryInterface, Sequelize) {
    // 1. Hapus tabel terlebih dahulu
    await queryInterface.dropTable('QuickIdeas');
    
    // 2. PENTING: PostgreSQL tidak otomatis menghapus TYPE ENUM saat tabel dihapus.
    // Kita harus menghapusnya secara manual agar tidak terjadi error saat migrasi ulang.
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_QuickIdeas_priority";');
  }
};