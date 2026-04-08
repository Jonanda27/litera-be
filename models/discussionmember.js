'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class DiscussionMember extends Model {
    static associate(models) {
      this.belongsTo(models.User, { foreignKey: 'user_id' });
      this.belongsTo(models.Discussion, { foreignKey: 'discussion_id' });
    }
  }
  DiscussionMember.init({
    discussion_id: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER,
    joined_at: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'DiscussionMember',
    tableName: 'Discussion_Members',
  });
  return DiscussionMember;
};