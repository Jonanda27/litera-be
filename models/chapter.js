import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class Chapter extends Model {
    static associate(models) {
      Chapter.belongsTo(models.Book, { foreignKey: 'bookId' });
      // Tambahkan relasi ke Outline
      Chapter.belongsTo(models.Outline, { foreignKey: 'outlineId' });
    }
  }

  Chapter.init({
    title: DataTypes.STRING,
    content: DataTypes.TEXT,
    page: DataTypes.INTEGER,
    outlineId: DataTypes.INTEGER, // TAMBAHKAN BARIS INI
    word_count: DataTypes.INTEGER,
    daily_target: DataTypes.INTEGER,
    is_safe: DataTypes.BOOLEAN,
    order_index: DataTypes.INTEGER,
    bookId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Chapter',
  });

  return Chapter;
};