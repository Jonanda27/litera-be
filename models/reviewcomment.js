'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class ReviewComment extends Model {
    static associate(models) {
      // Kita tidak menggunakan belongsTo yang kaku karena chapterId bisa merujuk ke dua tabel berbeda
    }
  }

  ReviewComment.init({
    chapterId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    highlight_id: {
      type: DataTypes.STRING,
      allowNull: false
    },
    selected_text: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    comment_text: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    label: {
      type: DataTypes.STRING,
      defaultValue: 'Cek Fakta'
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'open'
    }
  }, {
    sequelize,
    modelName: 'ReviewComment',
    tableName: 'Review_Comments',
  });

  return ReviewComment;
};