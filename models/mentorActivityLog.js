'use strict';
import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class MentorActivityLog extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Relasi ke Mentor (Siapa yang melakukan aksi)
      MentorActivityLog.belongsTo(models.Mentor, {
        foreignKey: 'mentor_id',
        as: 'mentor'
      });

      // Relasi ke User/Siswa (Siapa target aksinya, jika ada)
      MentorActivityLog.belongsTo(models.User, {
        foreignKey: 'target_user_id',
        as: 'targetUser'
      });
    }
  }

  MentorActivityLog.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    mentor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Mentors',
        key: 'id'
      }
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Contoh: WHATSAPP_REMINDER, MONITORING_VIEW, LOGIN'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    target_user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'MentorActivityLog',
    tableName: 'MentorActivityLogs',
    timestamps: true, // Akan otomatis mengelola createdAt dan updatedAt
  });

  return MentorActivityLog;
};