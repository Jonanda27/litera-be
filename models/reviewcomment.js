'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class ReviewComment extends Model {
    static associate(models) {
      // Relasi: Komentar dimiliki oleh satu bab (Chapter)
      this.belongsTo(models.Chapter, { foreignKey: 'chapterId' });
    }
  }

  ReviewComment.init({
    chapterId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    highlight_id: {
      type: DataTypes.STRING,
      allowNull: false // ID untuk scrollToHighlight (ex: highlight-17123)
    },
    selected_text: {
      type: DataTypes.TEXT,
      allowNull: false // Teks yang ditandai user
    },
    comment_text: {
      type: DataTypes.TEXT,
      allowNull: true // Catatan tambahan (opsional)
    },
    label: {
      type: DataTypes.STRING,
      defaultValue: 'Cek Fakta' // Cek Fakta, Plot Hole, dll
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'open' // open atau done
    }
  }, {
    sequelize,
    modelName: 'ReviewComment',
    tableName: 'Review_Comments', // Sesuaikan dengan nama di migrasi
  });

  return ReviewComment;
};