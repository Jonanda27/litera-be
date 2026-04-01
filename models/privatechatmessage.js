'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class PrivateChatMessage extends Model {
    static associate(models) {
      // Relasi ke Pengirim (User)
      this.belongsTo(models.User, { 
        foreignKey: 'senderId', 
        as: 'sender' 
      });

      // Relasi ke Penerima (User) - Tambahkan ini jika recipientId merujuk ke User
      this.belongsTo(models.User, { 
        foreignKey: 'recipientId', 
        as: 'recipient' // Alias harus berbeda dari 'sender'
      });
    }
  }

  PrivateChatMessage.init({
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    recipientId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    recipientRole: {
      type: DataTypes.ENUM('peserta', 'mentor', 'admin'),
      allowNull: false
    },
    roomId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'PrivateChatMessage',
    tableName: 'Private_Chat_Messages',
    underscored: false, // Sesuaikan dengan naming convention database kamu
  });

  return PrivateChatMessage;
};