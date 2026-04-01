'use strict';
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Private_Chat_Messages', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      senderId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      recipientId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        // Penerima bisa User (Peserta) atau Mentor
        // Karena di sistem Anda Mentor dan User di tabel berbeda, 
        // kita simpan ID-nya saja tanpa FK yang kaku atau gunakan targetRole
      },
      recipientRole: {
        type: Sequelize.ENUM('peserta', 'mentor', 'admin'),
        allowNull: false
      },
      roomId: {
        type: Sequelize.STRING, // Contoh: "private-chat-1-2"
        allowNull: false
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      isRead: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Tambahkan index agar pencarian riwayat chat per room cepat
    await queryInterface.addIndex('Private_Chat_Messages', ['roomId']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Private_Chat_Messages');
  }
};