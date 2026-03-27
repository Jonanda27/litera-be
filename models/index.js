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
import nonFictionResearchModel from "./nonfictionresearch.js";
import glossaryModel from "./glossary.js";
import nonFictionSourceModel from "./nonfictionsource.js";

// --- TAMBAHAN UNTUK TAHAP REVISI ---
import chapterVersionModel from "./chapterversion.js";
import reviewCommentModel from "./reviewcomment.js";
import dailyWordCountModel from "./dailywordcount.js";
import meetingModel from "./meeting.js";
import liveSessionModel from "./livesession.js";

// --- TAMBAHAN UNTUK FITUR CHAT & DISKUSI ---
import chatMessageModel from "./chatmessage.js";
import discussionModel from "./discussion.js";
import nonFictionCaseStudyModel from "./nonfictioncasestudy.js";
import quoteCollectionModel from "./quotecollection.js";
import nonFictionChapterStructureModel from "./nonfictionchapterstructure.js";
import discussionMemberModel from "./discussionmember.js";
import nonFictionChapterContentModel from "./nonfictionchaptercontent.js";
import chapterContentSummaryModel from "./chaptercontentsummary.js";
import activityLogModel from "./activitylog.js";

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
db.Meeting = meetingModel(sequelize, DataTypes);
db.LiveSession = liveSessionModel(sequelize, DataTypes);

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
db.NonFictionResearch = nonFictionResearchModel(sequelize, DataTypes);
db.Glossary = glossaryModel(sequelize, DataTypes);
db.NonFictionSource = nonFictionSourceModel(sequelize, DataTypes);
db.NonFictionCaseStudy = nonFictionCaseStudyModel(sequelize, DataTypes);
db.QuoteCollection = quoteCollectionModel(sequelize, DataTypes);
db.NonFictionChapterStructure = nonFictionChapterStructureModel(sequelize, DataTypes);
db.DiscussionMember = discussionMemberModel(sequelize, DataTypes);
db.NonFictionChapterContent = nonFictionChapterContentModel(sequelize, DataTypes);
db.ChapterContentSummary = chapterContentSummaryModel(sequelize, DataTypes);
db.ActivityLog = activityLogModel(sequelize, DataTypes);

// --- Inisialisasi Model Revisi ---
db.ChapterVersion = chapterVersionModel(sequelize, DataTypes);
db.ReviewComment = reviewCommentModel(sequelize, DataTypes);

// --- Inisialisasi Model Chat & Diskusi ---
db.ChatMessage = chatMessageModel(sequelize, DataTypes);
db.Discussion = discussionModel(sequelize, DataTypes);

// 2. Definisi Relasi (Asosiasi) Secara Manual
// --- RELASI USER & MENTOR ---
db.Mentor.hasMany(db.User, { foreignKey: 'mentor_id', as: 'students' });
db.User.belongsTo(db.Mentor, { foreignKey: 'mentor_id', as: 'mentor' });

db.Discussion.hasMany(db.ChatMessage, { foreignKey: 'discussionId', as: 'messages' });
db.ChatMessage.belongsTo(db.Discussion, { foreignKey: 'discussionId' });

db.User.hasMany(db.ChatMessage, { foreignKey: 'senderId', as: 'userMessages' });
db.ChatMessage.belongsTo(db.User, { foreignKey: 'senderId', as: 'sender' });

db.User.hasMany(db.Book, { foreignKey: 'userId', as: 'books' });
db.Book.belongsTo(db.User, { foreignKey: 'userId' });

db.Book.hasOne(db.QuickIdea, { foreignKey: 'bookId' });
db.QuickIdea.belongsTo(db.Book, { foreignKey: 'bookId' });

db.Book.hasMany(db.Character, { foreignKey: 'bookId' });
db.Character.belongsTo(db.Book, { foreignKey: 'bookId' });

db.Book.hasMany(db.Chapter, { foreignKey: 'bookId' });
db.Chapter.belongsTo(db.Book, { foreignKey: 'bookId' });

db.Book.hasMany(db.Outline, { foreignKey: 'bookId' });
db.Outline.belongsTo(db.Book, { foreignKey: 'bookId' });

db.Book.hasMany(db.Plot, { foreignKey: 'bookId' });
db.Plot.belongsTo(db.Book, { foreignKey: 'bookId' });

db.Book.hasMany(db.Research, { foreignKey: 'bookId' });
db.Research.belongsTo(db.Book, { foreignKey: 'bookId' });

db.Book.hasMany(db.Timeline, { foreignKey: 'bookId' });
db.Timeline.belongsTo(db.Book, { foreignKey: 'bookId' });

db.Book.hasMany(db.MoodBoard, { foreignKey: 'bookId' });
db.MoodBoard.belongsTo(db.Book, { foreignKey: 'bookId' });

db.Book.hasOne(db.Setting, { foreignKey: 'bookId' });
db.Setting.belongsTo(db.Book, { foreignKey: 'bookId' });

db.Book.hasOne(db.NonFictionResearch, { foreignKey: 'bookId', as: 'nonFictionResearch' });
db.NonFictionResearch.belongsTo(db.Book, { foreignKey: 'bookId' });

db.Book.hasMany(db.DailyWordCount, { foreignKey: 'bookId', as: 'dailyStats' });
db.DailyWordCount.belongsTo(db.Book, { foreignKey: 'bookId' });

db.Chapter.hasMany(db.ChapterVersion, { foreignKey: 'chapterId', as: 'versions' });
db.ChapterVersion.belongsTo(db.Chapter, { foreignKey: 'chapterId' });

db.Chapter.hasMany(db.ReviewComment, { foreignKey: 'chapterId', as: 'comments' });
db.ReviewComment.belongsTo(db.Chapter, { foreignKey: 'chapterId' });

db.Book.hasMany(db.Glossary, { foreignKey: 'bookId' });
db.Glossary.belongsTo(db.Book, { foreignKey: 'bookId' });

db.Book.hasMany(db.NonFictionSource, { foreignKey: 'bookId', as: 'sources' });
db.NonFictionSource.belongsTo(db.Book, { foreignKey: 'bookId' });

db.Book.hasMany(db.NonFictionCaseStudy, { foreignKey: 'bookId', as: 'caseStudies' });
db.NonFictionCaseStudy.belongsTo(db.Book, { foreignKey: 'bookId' });

db.Book.hasMany(db.QuoteCollection, { foreignKey: 'bookId', as: 'quoteCollections' });
db.QuoteCollection.belongsTo(db.Book, { foreignKey: 'bookId' });

db.Book.hasMany(db.NonFictionChapterStructure, { foreignKey: 'bookId', as: 'chapterStructures' });
db.NonFictionChapterStructure.belongsTo(db.Book, { foreignKey: 'bookId' });

db.Book.hasMany(db.ChapterContentSummary, { foreignKey: 'bookId' });
db.ChapterContentSummary.belongsTo(db.Book, { foreignKey: 'bookId' });

db.User.hasMany(db.ActivityLog, { foreignKey: 'userId', as: 'activities' });
db.ActivityLog.belongsTo(db.User, { foreignKey: 'userId', as: 'actor' });

// --- RELASI LESSON & USERPROGRESS (Tambahkan ini) ---
db.Lesson.hasMany(db.UserProgress, { foreignKey: 'lesson_id', as: 'userProgress' });
db.UserProgress.belongsTo(db.Lesson, { foreignKey: 'lesson_id', as: 'lesson' });

// --- RELASI USER & USERPROGRESS (Tambahkan jika belum ada) ---
db.User.hasMany(db.UserProgress, { foreignKey: 'user_id', as: 'progressList' });
db.UserProgress.belongsTo(db.User, { foreignKey: 'user_id' });

// --- RELASI MODULE & LESSON (Opsional tapi penting) ---
db.Module.hasMany(db.Lesson, { foreignKey: 'module_id', as: 'lessons' });
db.Lesson.belongsTo(db.Module, { foreignKey: 'module_id' });


db.User.belongsToMany(db.Discussion, {
  through: db.DiscussionMember,
  foreignKey: 'user_id',
  as: 'joinedDiscussions'
});
db.Discussion.belongsToMany(db.User, {
  through: db.DiscussionMember,
  foreignKey: 'discussion_id',
  as: 'members'
});

// --- TAMBAHAN AGAR SERVICE BISA MEMBACA KONEKSI DAN TRANSACTION ---
db.sequelize = sequelize;
db.Sequelize = Sequelize;

// 3. Jalankan asosiasi otomatis
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate &&
    // Tambahkan model baru ke daftar pengecualian jika tidak ingin diproses otomatis di loop ini
    modelName !== 'ChatMessage' &&
    modelName !== 'Mentor' &&
    modelName !== 'User' &&
    modelName !== 'Book' &&
    modelName !== 'Discussion' &&
    modelName !== 'NonFictionResearch' &&
    modelName !== 'NonFictionChapterContent' &&
    modelName !== 'ActivityLog') {
    db[modelName].associate(db);
  }
});

export { sequelize, Sequelize, DataTypes };

// 4. Export semua model
export const {
  Mentor, Level, User, Module, Lesson, Project, UserProgress, Certificate,
  Book, Chapter, Character, Material, MoodBoard, Outline, Plot, QuickIdea,
  Research, Setting, Timeline, ChapterVersion, ReviewComment, DailyWordCount,
  ChatMessage, Discussion, NonFictionResearch, Glossary, NonFictionSource,
  NonFictionCaseStudy, QuoteCollection, NonFictionChapterStructure, Meeting, LiveSession,
  DiscussionMember, NonFictionChapterContent, ChapterContentSummary, ActivityLog
} = db;

export default db;