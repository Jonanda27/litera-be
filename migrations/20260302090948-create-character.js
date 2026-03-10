// migrations/XXXXXXXXXXXXXX-create-character.js
'use strict';
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Characters', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      bookId: { 
        type: Sequelize.INTEGER, 
        allowNull: false, 
        references: { model: 'Books', key: 'id' }, 
        onUpdate: 'CASCADE', onDelete: 'CASCADE' 
      },
      fullName: { type: Sequelize.STRING, allowNull: false },
      nickname: { type: Sequelize.STRING },
      role: { type: Sequelize.STRING },
      imageUrl: { type: Sequelize.TEXT }, // Untuk Base64 atau URL
      // Data Diri
      age: { type: Sequelize.STRING },
      dob: { type: Sequelize.STRING },
      gender: { type: Sequelize.STRING },
      job: { type: Sequelize.STRING },
      address: { type: Sequelize.STRING },
      status: { type: Sequelize.STRING },
      // Fisik
      height: { type: Sequelize.STRING },
      hair: { type: Sequelize.STRING },
      eyes: { type: Sequelize.STRING },
      physicalTrait: { type: Sequelize.STRING },
      clothing: { type: Sequelize.STRING },
      // Kepribadian (Disimpan sebagai JSONB)
      goodTraits: { type: Sequelize.JSONB, defaultValue: [] },
      badTraits: { type: Sequelize.JSONB, defaultValue: [] },
      fear: { type: Sequelize.STRING },
      dream: { type: Sequelize.STRING },
      habit: { type: Sequelize.STRING },
      speakingStyle: { type: Sequelize.STRING },
      // Latar Belakang
      past: { type: Sequelize.TEXT },
      turningPoint: { type: Sequelize.TEXT },
      // Arc & Relationships (JSONB)
      relationships: { type: Sequelize.JSONB, defaultValue: [] },
      arcStart: { type: Sequelize.TEXT },
      arcEnd: { type: Sequelize.TEXT },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Characters');
  }
};