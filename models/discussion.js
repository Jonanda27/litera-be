// litera-be/models/discussion.js
'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Discussion extends Model {
    static associate(models) {
      // Relasi: Diskusi dimiliki oleh satu User (Pemilik)
      this.belongsTo(models.User, { foreignKey: 'owner_id', as: 'owner' });
      // Relasi hasMany ke ChatMessage tetap ada di models/index.js [cite: 1844]
    }
  }
  Discussion.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    owner_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Discussion',
    tableName: 'Discussions',
  });
  return Discussion;
};