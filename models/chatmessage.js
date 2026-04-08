'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class ChatMessage extends Model {
    static associate(models) {
      // Relasi dikelola secara manual di models/index.js
    }
  }
  ChatMessage.init({
    discussionId: { 
      type: DataTypes.INTEGER, 
      allowNull: false 
    },
    senderId: { 
      type: DataTypes.INTEGER, 
      allowNull: false 
    },
    message: { 
      type: DataTypes.TEXT, 
      allowNull: true // Ubah ke true agar bisa kirim gambar saja tanpa teks
    },
    imageUrl: { 
      type: DataTypes.TEXT, // Menggunakan TEXT untuk menampung string Base64
      allowNull: true 
    }
  }, {
    sequelize,
    modelName: 'ChatMessage',
    tableName: 'Chat_Messages', 
  });
  return ChatMessage;
};