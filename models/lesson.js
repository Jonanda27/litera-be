'use strict';
import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class Lesson extends Model {
    static associate(models) {
      this.belongsTo(models.Module, { foreignKey: 'module_id' });
      this.hasMany(models.UserProgress, { foreignKey: 'lesson_id' });
    }
  }
  Lesson.init({
    judul_materi: DataTypes.STRING,
    tipe_konten: DataTypes.STRING,
    url_konten: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Lesson',
  });
  return Lesson;
};