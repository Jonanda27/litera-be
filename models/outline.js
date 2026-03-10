// models/outline.js
import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class Outline extends Model {
    static associate(models) {
      Outline.belongsTo(models.Book, { foreignKey: 'bookId' });
    }
  }
  Outline.init({
    bookId: { type: DataTypes.INTEGER, allowNull: false },
    chapter_number: DataTypes.STRING,
    title: { type: DataTypes.STRING, allowNull: false },
    pov: DataTypes.STRING,
    location: DataTypes.STRING,
    time_setting: DataTypes.STRING,
    sub_chapters: { type: DataTypes.JSONB, defaultValue: [] },
    notes: DataTypes.TEXT,
    status: DataTypes.ENUM('Ide', 'Outline', 'Draft', 'Revisi', 'Selesai')
  }, {
    sequelize,
    modelName: 'Outline',
    tableName: 'Outlines'
  });
  return Outline;
};