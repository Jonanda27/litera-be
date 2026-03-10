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
      allowNull: false 
    }
  }, {
    sequelize,
    modelName: 'ChatMessage',
    tableName: 'Chat_Messages', // Pastikan nama tabel di DB sesuai 
  });
  return ChatMessage;
};