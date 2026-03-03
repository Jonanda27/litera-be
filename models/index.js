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

// Inisialisasi model [cite: 242, 416]
db.Mentor = mentorModel(sequelize, DataTypes);
db.Level = levelModel(sequelize, DataTypes);
db.User = userModel(sequelize, DataTypes);
db.Module = moduleModel(sequelize, DataTypes);
db.Lesson = lessonModel(sequelize, DataTypes);
db.Project = projectModel(sequelize, DataTypes);
db.UserProgress = userProgressModel(sequelize, DataTypes);
db.Certificate = certificateModel(sequelize, DataTypes);

// --- Inisialisasi Model Baru ke db ---
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

// Jalankan asosiasi [cite: 244, 417]
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

export { sequelize, Sequelize, DataTypes };
// Export semua model agar bisa di-destructure [cite: 245, 418]
export const { 
  Mentor, Level, User, Module, Lesson, Project, UserProgress, Certificate,
  Book, Chapter, Character, Material, MoodBoard, Outline, Plot, QuickIdea, 
  Research, Setting, Timeline 
} = db;

export default db;