'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Discussion extends Model {
    static associate(models) {
      // Relasi hasMany ke ChatMessage ada di models/index.js
    }
  }
  Discussion.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    }
  }, {
    sequelize,
    modelName: 'Discussion',
    tableName: 'Discussions',
  });
  return Discussion;
};