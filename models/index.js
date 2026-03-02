'use strict';

import { Sequelize, DataTypes } from "sequelize";
import userModel from "./user.js";
import mentorModel from "./mentor.js";
import levelModel from "./level.js";
import moduleModel from "./module.js";
import lessonModel from "./lesson.js";
import projectModel from "./project.js";
import userProgressModel from "./userprogress.js";
// 1. Tambahkan impor model certificate [cite: 133]
import certificateModel from "./certificate.js"; 

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

// Inisialisasi model [cite: 135]
db.Mentor = mentorModel(sequelize, DataTypes);
db.Level = levelModel(sequelize, DataTypes);
db.User = userModel(sequelize, DataTypes);
db.Module = moduleModel(sequelize, DataTypes);
db.Lesson = lessonModel(sequelize, DataTypes);
db.Project = projectModel(sequelize, DataTypes);
db.UserProgress = userProgressModel(sequelize, DataTypes);
// 2. Inisialisasi model Certificate ke dalam objek db [cite: 136]
db.Certificate = certificateModel(sequelize, DataTypes); 

// Jalankan asosiasi [cite: 137]
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

export { sequelize, Sequelize, DataTypes };
// 3. Tambahkan Certificate ke dalam daftar export [cite: 138]
export const { 
  Mentor, 
  Level, 
  User, 
  Module, 
  Lesson, 
  Project, 
  UserProgress, 
  Certificate 
} = db;

export default db;