'use strict';
import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class NonFictionSource extends Model {
    static associate(models) {
      this.belongsTo(models.Book, { foreignKey: 'bookId' });
    }
  }
  NonFictionSource.init({
    bookId: { type: DataTypes.INTEGER, allowNull: false },
    type: DataTypes.STRING,
    title: { type: DataTypes.STRING, allowNull: false },
    author: DataTypes.STRING,
    year: DataTypes.STRING,
    publisherUrl: DataTypes.TEXT,
    isbnDoi: DataTypes.STRING,
    relatedChapters: { type: DataTypes.JSONB, defaultValue: ["", "", ""] },
    quotes: DataTypes.TEXT,
    pageRef: DataTypes.STRING,
    notes: DataTypes.TEXT,
    credibility: DataTypes.ENUM('Tinggi', 'Sedang', 'Rendah'),
    citationStatus: DataTypes.ENUM('Belum dipake', 'Udah dipake', 'Buat referensi aja')
  }, {
    sequelize,
    modelName: 'NonFictionSource',
    tableName: 'NonFictionSources',
  });
  return NonFictionSource;
};