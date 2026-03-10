// models/plot.js
'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Plot extends Model {
    static associate(models) {
      this.belongsTo(models.Book, { foreignKey: 'bookId' });
    }
  }
  Plot.init({
    bookId: DataTypes.INTEGER,
    title: DataTypes.STRING,
    act: DataTypes.ENUM('Babak 1: Pengenalan', 'Babak 2: Konflik Meningkat', 'Babak 3: Klimaks', 'Babak 4: Resolusi'),
    chapterNum: DataTypes.STRING,
    sequenceNum: DataTypes.STRING,
    location: DataTypes.STRING,
    time: DataTypes.STRING,
    characters: DataTypes.TEXT,
    summary: DataTypes.TEXT,
    conflict: DataTypes.TEXT,
    sceneFunction: DataTypes.STRING,
    prevScene: DataTypes.STRING,
    nextScene: DataTypes.STRING,
    status: DataTypes.ENUM('Ide', 'Draft', 'Selesai'),
    labelColor: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Plot',
    tableName: 'Plots'
  });
  return Plot;
};