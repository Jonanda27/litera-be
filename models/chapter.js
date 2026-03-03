import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class Chapter extends Model {
    static associate(models) {
      // Menghubungkan chapter ke buku
      Chapter.belongsTo(models.Book, { foreignKey: 'bookId' });
    }
  }

  Chapter.init({
    title: DataTypes.STRING,
    content: DataTypes.TEXT,
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