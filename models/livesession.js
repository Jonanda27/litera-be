'use strict';
import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class LiveSession extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  LiveSession.init({
    title: DataTypes.STRING,
    description: DataTypes.STRING,
    speaker_name: DataTypes.STRING,
    poster_url: DataTypes.STRING,
    scheduled_at: DataTypes.DATE,
    recording_url: DataTypes.STRING,
    room_name: DataTypes.STRING,
    status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'LiveSession',
  });
  return LiveSession;
};