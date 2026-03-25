'use strict';
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Chat_Messages', {
      id: { 
        allowNull: false, 
        autoIncrement: true, 
        primaryKey: true, 
        type: Sequelize.INTEGER 
      },
      discussionId: { 
        type: Sequelize.INTEGER, 
        allowNull: false, 
        references: { model: 'Discussions', key: 'id' }, 
        onUpdate: 'CASCADE', 
        onDelete: 'CASCADE' 
      },
      senderId: { 
        type: Sequelize.INTEGER, 
        allowNull: false, 
        references: { model: 'Users', key: 'id' }, 
        onUpdate: 'CASCADE', 
        onDelete: 'CASCADE' 
      },
      message: { 
        type: Sequelize.TEXT, 
        allowNull: true // Izinkan null jika user hanya mengirim gambar
      },
      imageUrl: { 
        type: Sequelize.TEXT, // Kolom baru untuk data gambar
        allowNull: true 
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
  },
  async down(queryInterface, Sequelize) { 
    await queryInterface.dropTable('Chat_Messages'); 
  }
};