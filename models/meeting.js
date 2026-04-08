'use strict';
import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class Meeting extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.hasOne(models.Discussion, { foreignKey: 'meeting_id' });
    }
  }
  Meeting.init({
    title: DataTypes.STRING,
    room_name: {
      type: DataTypes.STRING,
      unique: true
    },
    description: DataTypes.TEXT,
    status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Meeting',
  });
  return Meeting;
};