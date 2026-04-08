'use strict';
import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class UserProgress extends Model {
    static associate(models) {
      // Pastikan setiap relasi dipisahkan dengan titik koma (;)
      this.belongsTo(models.User, { foreignKey: 'user_id' });
      this.belongsTo(models.Lesson, { foreignKey: 'lesson_id' });
      this.belongsTo(models.Module, { foreignKey: 'module_id' });
      
    }
  }

  UserProgress.init({
    // Pastikan setiap properti dipisahkan dengan koma (,)
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    module_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    lesson_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status_selesai: { 
      type: DataTypes.BOOLEAN, 
      defaultValue: false 
    },
    jawaban_user: { type: DataTypes.JSONB, allowNull: true }, // Tambahkan ini
    skor: { type: DataTypes.INTEGER, allowNull: true }
  }, {
    sequelize,
    modelName: 'UserProgress',
    tableName: 'User_Progress'
  });

  return UserProgress;
};