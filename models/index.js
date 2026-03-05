'use strict';

import { Sequelize, DataTypes } from "sequelize";
import userModel from "./user.js";
import mentorModel from "./mentor.js";
import levelModel from "./level.js";
import moduleModel from "./module.js";
import lessonModel from "./lesson.js";
import projectModel from "./project.js";
import userProgressModel from "./userprogress.js";
import certificateModel from "./certificate.js";
// --- Tambahan Model Baru --- 
import bookModel from "./book.js";
import chapterModel from "./chapter.js";
import characterModel from "./character.js";
import materialModel from "./material.js";
import moodboardModel from "./moodboard.js";
import outlineModel from "./outline.js";
import plotModel from "./plot.js";
import quickIdeaModel from "./quickidea.js";
import researchModel from "./research.js";
import settingModel from "./setting.js";
import timelineModel from "./timeline.js";
// --- TAMBAHAN UNTUK TAHAP REVISI ---
import chapterVersionModel from "./chapterversion.js";
import reviewCommentModel from "./reviewcomment.js";
import dailyWordCountModel from "./dailywordcount.js";

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: "postgres",
    logging: false,
  }
);

const db = {};

// 1. Inisialisasi Model
db.Mentor = mentorModel(sequelize, DataTypes);
db.Level = levelModel(sequelize, DataTypes);
db.User = userModel(sequelize, DataTypes);
db.Module = moduleModel(sequelize, DataTypes);
db.Lesson = lessonModel(sequelize, DataTypes);
db.Project = projectModel(sequelize, DataTypes);
db.UserProgress = userProgressModel(sequelize, DataTypes);
db.Certificate = certificateModel(sequelize, DataTypes);

// --- Inisialisasi Model Penulisan Buku ---
db.Book = bookModel(sequelize, DataTypes);
db.Chapter = chapterModel(sequelize, DataTypes);
db.Character = characterModel(sequelize, DataTypes);
db.Material = materialModel(sequelize, DataTypes);
db.MoodBoard = moodboardModel(sequelize, DataTypes);
db.Outline = outlineModel(sequelize, DataTypes);
db.Plot = plotModel(sequelize, DataTypes);
db.QuickIdea = quickIdeaModel(sequelize, DataTypes);
db.Research = researchModel(sequelize, DataTypes);
db.Setting = settingModel(sequelize, DataTypes);
db.Timeline = timelineModel(sequelize, DataTypes);
db.DailyWordCount = dailyWordCountModel(sequelize, DataTypes);

// --- Inisialisasi Model Revisi ---
db.ChapterVersion = chapterVersionModel(sequelize, DataTypes);
db.ReviewComment = reviewCommentModel(sequelize, DataTypes);

// 2. Definisi Relasi (Asosiasi) Secara Manual

// Relasi User & Book [cite: 527]
db.User.hasMany(db.Book, { foreignKey: 'userId', as: 'books' });
db.Book.belongsTo(db.User, { foreignKey: 'userId' });

// Relasi Book & QuickIdea (1:1) [cite: 528]
db.Book.hasOne(db.QuickIdea, { foreignKey: 'bookId' });
db.QuickIdea.belongsTo(db.Book, { foreignKey: 'bookId' });

// Relasi Book & Karakter (1:N) [cite: 529]
db.Book.hasMany(db.Character, { foreignKey: 'bookId' });
db.Character.belongsTo(db.Book, { foreignKey: 'bookId' });

// Relasi Book & Chapter (1:N) [cite: 530]
db.Book.hasMany(db.Chapter, { foreignKey: 'bookId' });
db.Chapter.belongsTo(db.Book, { foreignKey: 'bookId' });

// Relasi Book & Outline (1:N) [cite: 531]
db.Book.hasMany(db.Outline, { foreignKey: 'bookId' });
db.Outline.belongsTo(db.Book, { foreignKey: 'bookId' });

// Relasi Book & Plot (1:N) [cite: 532]
db.Book.hasMany(db.Plot, { foreignKey: 'bookId' });
db.Plot.belongsTo(db.Book, { foreignKey: 'bookId' });

// Relasi Book & Research (1:N) [cite: 533]
db.Book.hasMany(db.Research, { foreignKey: 'bookId' });
db.Research.belongsTo(db.Book, { foreignKey: 'bookId' });

// Relasi Book & Timeline (1:N) [cite: 534]
db.Book.hasMany(db.Timeline, { foreignKey: 'bookId' });
db.Timeline.belongsTo(db.Book, { foreignKey: 'bookId' });

// Relasi Book & MoodBoard (1:N) [cite: 535]
db.Book.hasMany(db.MoodBoard, { foreignKey: 'bookId' });
db.MoodBoard.belongsTo(db.Book, { foreignKey: 'bookId' });

// Relasi Book & Setting (1:1) [cite: 536]
db.Book.hasOne(db.Setting, { foreignKey: 'bookId' });
db.Setting.belongsTo(db.Book, { foreignKey: 'bookId' });

db.Book.hasMany(db.DailyWordCount, { foreignKey: 'bookId', as: 'dailyStats' });
db.DailyWordCount.belongsTo(db.Book, { foreignKey: 'bookId' });

// --- RELASI TAMBAHAN UNTUK TAHAP REVISI ---

// Relasi Chapter & ChapterVersion (Riwayat Versi Draf)
db.Chapter.hasMany(db.ChapterVersion, { foreignKey: 'chapterId', as: 'versions' });
db.ChapterVersion.belongsTo(db.Chapter, { foreignKey: 'chapterId' });

// Relasi Chapter & ReviewComment (Komentar/Highlight pada Naskah)
db.Chapter.hasMany(db.ReviewComment, { foreignKey: 'chapterId', as: 'comments' });
db.ReviewComment.belongsTo(db.Chapter, { foreignKey: 'chapterId' });


// 3. Jalankan asosiasi otomatis (Untuk model lama yang mendefinisikan associate di filenya) 
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

export { sequelize, Sequelize, DataTypes };

// 4. Export semua model agar bisa di-destructure [cite: 538]
export const { 
  Mentor, Level, User, Module, Lesson, Project, UserProgress, Certificate,
  Book, Chapter, Character, Material, MoodBoard, Outline, Plot, QuickIdea, 
  Research, Setting, Timeline, ChapterVersion, ReviewComment, DailyWordCount // Tambahkan DailyWordCount di sini
} = db;

export default db;