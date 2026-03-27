import express from "express";
import { 
  savePramenulis, 
  saveChapterContent, 
  savePengembanganCerita, 
  getChapterContent, 
  getCharacters, 
  getAllBooks, 
  getBookDetail, 
  getPramenulis, 
  getPengembangan, 
  getCommentsByChapter, 
  saveComment,
  deleteComment,
  saveChapterVersion,
  getChapterVersions,
  createBook,
  getWeeklyStats,
  getChatHistory,
  getDiscussionHistory,
  getBookById,
  getMyBooks,
  saveCovers,
  savePDFToDB,
  downloadPDF,
  getAllPublishedBooks,
  restoreVersion
} from "../controllers/bookController.js";

import { 
  addQuickIdea,
  getQuickIdeas,
  deleteQuickIdea,
  updateQuickIdea
} from "../controllers/quickideController.js";

import { 
  addResearch,
  getResearchesByBook,
  deleteResearch,
  updateResearch
} from "../controllers/researchController.js";

import { 
  createCharacter, 
  getCharactersByBook, 
  updateCharacter, 
  deleteCharacter 
} from "../controllers/characterController.js";
import { 
  createSetting, 
  getSettingsByBook, 
  updateSetting, 
  deleteSetting 
} from "../controllers/settingController.js";

import { 
  createTimelineEvent, 
  getTimelineEventsByBook, 
  updateTimelineEvent, 
  deleteTimelineEvent 
} from "../controllers/timelineController.js";

// routes/bookRoutes.js
import { 
  createPlot, 
  getPlotsByBook, 
  updatePlot, 
  deletePlot 
} from "../controllers/plotController.js";

import { 
    saveNonFictionResearch, 
    getNonFictionResearch,
    deleteNonFictionResearch,
    getChapterContentnonfiksi, 
     saveChapterContentnonfiksi
} from "../controllers/nonFictionController.js";

import { 
  addSource, 
  getSourcesByBook, 
  updateSource, 
  deleteSource 
} from "../controllers/sourceManagementController.js";

import { 
  createGlossary, 
  getGlossaryByBook, 
  updateGlossary, 
  deleteGlossary 
} from "../controllers/glossaryController.js";

import { 
  addCaseStudy, 
  getCaseStudiesByBook, 
  updateCaseStudy, 
  deleteCaseStudy 
} from "../controllers/caseStudyController.js";

import { 
  addQuote, 
  getQuotesByBook, 
  updateQuote, 
  deleteQuote 
} from "../controllers/quoteController.js";

import { 
  addChapterStructure, 
  getStructuresByBook, 
  updateChapterStructure, 
  deleteChapterStructure 
} from "../controllers/chapterStructureController.js";


import { addVisionItem, getVisionBoard, updateVisionItem, deleteVisionItem } from "../controllers/moodboardController.js";
import { createOutline, getOutlinesByBook, updateOutline, deleteOutline } from "../controllers/outlineController.js";
import { getAllDiscussions, createDiscussion, getMyJoinedDiscussions, joinDiscussion, getDiscussionMembers  } from "../controllers/discussionController.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// --- 1. ROUTE STATIS (TANPA PARAMETER :) ---
// Letakkan semua route GET statis di sini agar tidak bentrok dengan /:id
router.get('/all', verifyToken, getAllBooks);
router.get('/all-published', verifyToken, getAllPublishedBooks);
router.get('/characters', verifyToken, getCharacters);
router.get("/get-chapter", verifyToken, getChapterContent);
router.get("/get-comments", verifyToken, getCommentsByChapter);
router.get("/get-versions", verifyToken, getChapterVersions);
router.get("/stats/:bookId", verifyToken, getWeeklyStats);
router.get("/chat-history/:bookId", verifyToken, getChatHistory); // Tambahkan ini [cite: 667]
router.get("/discussion-history/:discussionId", verifyToken, getDiscussionHistory);
router.get("/:bookId", verifyToken, getBookById);
// --- 2. ROUTE POST (TIDAK BENTROK DENGAN GET) ---
router.post("/pramenulis", verifyToken, savePramenulis);
router.post("/save-chapter", verifyToken, saveChapterContent);
router.post("/pengembangan", verifyToken, savePengembanganCerita);
router.post("/save-comment", verifyToken, saveComment);
router.post("/delete-comment", verifyToken, deleteComment);
router.post("/save-chapter-version", verifyToken, saveChapterVersion);
router.post("/", verifyToken, createBook);
router.post("/restore-version", verifyToken, restoreVersion);

//HTMLPDF
// router.post('/generate-pdf', verifyToken, generatePDF);
router.post('/download-pdf', verifyToken, downloadPDF);
router.post('/save-pdf-db', verifyToken, savePDFToDB);

//COVER
router.post('/save-covers', verifyToken, saveCovers);

//QUICK IDEA
router.post("/quick-ideas", verifyToken, addQuickIdea);
router.get("/quick-ideas/:bookId", verifyToken, getQuickIdeas);
router.patch("/quick-ideas/:id", verifyToken, updateQuickIdea);
router.delete("/quick-ideas/:id", verifyToken, deleteQuickIdea);

//PAPAN VISI
router.post("/vision-board", verifyToken, addVisionItem);
router.get("/vision-board/:bookId", verifyToken, getVisionBoard);
router.patch("/vision-board/:id", verifyToken, updateVisionItem);
router.delete("/vision-board/:id", verifyToken, deleteVisionItem);

//RISET
router.post("/research", verifyToken, addResearch);
router.get("/research/:bookId", verifyToken, getResearchesByBook);
router.delete("/research/:id", verifyToken, deleteResearch);
router.patch('/research/:id', verifyToken, updateResearch);

//OUTLINE
router.post("/outlines", verifyToken, createOutline);
router.get("/outlines/:bookId", verifyToken, getOutlinesByBook);
router.put("/outlines/:id", verifyToken, updateOutline);
router.delete("/outlines/:id", verifyToken, deleteOutline);

//CHARACTER
router.post("/characters", verifyToken, createCharacter);
router.get("/characters/:bookId", verifyToken, getCharactersByBook);
router.patch("/characters/:id", verifyToken, updateCharacter);
router.delete("/characters/:id", verifyToken, deleteCharacter);

//WorldBuilding
router.post("/settings", verifyToken, createSetting);
router.get("/settings/:bookId", verifyToken, getSettingsByBook);
router.patch("/settings/:id", verifyToken, updateSetting);
router.delete("/settings/:id", verifyToken, deleteSetting);

// TIMELINE 
router.post("/timeline", verifyToken, createTimelineEvent);
router.get("/timeline/:bookId", verifyToken, getTimelineEventsByBook);
router.patch("/timeline/:id", verifyToken, updateTimelineEvent);
router.delete("/timeline/:id", verifyToken, deleteTimelineEvent);


// STORY BOARD / PLOT ROUTES
router.post("/plots", verifyToken, createPlot);
router.get("/plots/:bookId", verifyToken, getPlotsByBook);
router.patch("/plots/:id", verifyToken, updatePlot);
router.delete("/plots/:id", verifyToken, deletePlot);

//NON FIKSI
router.post("/non-fiction/research", verifyToken, saveNonFictionResearch);
router.get("/non-fiction/research/:bookId", verifyToken, getNonFictionResearch);
router.delete("/non-fiction/research/:bookId", verifyToken, deleteNonFictionResearch);


//DAFTAR ISTILAH
router.post("/glossary", verifyToken, createGlossary);
router.get("/glossary/:bookId", verifyToken, getGlossaryByBook);
router.patch("/glossary/:id", verifyToken, updateGlossary);
router.delete("/glossary/:id", verifyToken, deleteGlossary);


// SOURCE MANAGEMENT ROUTES
router.post("/sources", verifyToken, addSource);
router.get("/sources/:bookId", verifyToken, getSourcesByBook);
router.patch("/sources/:id", verifyToken, updateSource);
router.delete("/sources/:id", verifyToken, deleteSource);

// CASE STUDY ROUTES
router.post("/case-studies", verifyToken, addCaseStudy);
router.get("/case-studies/:bookId", verifyToken, getCaseStudiesByBook);
router.patch("/case-studies/:id", verifyToken, updateCaseStudy);
router.delete("/case-studies/:id", verifyToken, deleteCaseStudy);

// QUOTE COLLECTION ROUTES
router.post("/quotes", verifyToken, addQuote);
router.get("/quotes/:bookId", verifyToken, getQuotesByBook);
router.patch("/quotes/:id", verifyToken, updateQuote);
router.delete("/quotes/:id", verifyToken, deleteQuote);

// CHAPTER STRUCTURE ROUTES
router.post("/chapter-structures", verifyToken, addChapterStructure);
router.get("/chapter-structures/:bookId", verifyToken, getStructuresByBook);
router.patch("/chapter-structures/:id", verifyToken, updateChapterStructure);
router.delete("/chapter-structures/:id", verifyToken, deleteChapterStructure);

router.post("/non-fiction/save-content", verifyToken, saveChapterContentnonfiksi);
router.get("/non-fiction/get-content", verifyToken, getChapterContentnonfiksi);


// Tambahkan route ini di bagian diskusi/chat
router.get("/discussions/all", verifyToken, getAllDiscussions);
router.post("/discussions/create", verifyToken, createDiscussion);
router.post("/discussions/join", verifyToken, joinDiscussion);
router.get("/discussions/my-joined", verifyToken, getMyJoinedDiscussions);
router.get("/discussions/members/:discussionId", verifyToken, getDiscussionMembers);

// --- 3. ROUTE DENGAN PARAMETER KHUSUS ---
router.get("/pramenulis/:bookId", verifyToken, getPramenulis);
router.get("/pengembangan/:bookId", verifyToken, getPengembangan);

// --- 4. ROUTE DINAMIS UMUM (ID) ---
// WAJIB diletakkan paling bawah karena /:id bisa menerima string apa saja
router.get('/:id', verifyToken, getBookDetail);
router.get("/", verifyToken, getMyBooks);

export default router;