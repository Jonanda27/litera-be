'use strict';
import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class Glossary extends Model {
    static associate(models) {
      this.belongsTo(models.Book, { foreignKey: 'bookId' });
    }
  }
  Glossary.init({
    bookId: { type: DataTypes.INTEGER, allowNull: false },
    term: { type: DataTypes.STRING, allowNull: false },
    category: DataTypes.STRING,
    shortDef: DataTypes.TEXT,
    fullDef: DataTypes.TEXT,
    example: DataTypes.STRING,
    bab: DataTypes.STRING,
    hal: DataTypes.STRING,
    relatedTerms: { type: DataTypes.JSONB, defaultValue: [] },
    needsDiagram: { type: DataTypes.BOOLEAN, defaultValue: false }
  }, {
    sequelize,
    modelName: 'Glossary',
    tableName: 'Glossaries',
  });
  return Glossary;
};