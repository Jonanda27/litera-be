import express from 'express';
import { 
    chatWithJournalAI, 
    processGrammarAI, 
    checkCharacterConsistency,
    suggestBookTitles 
} from '../controllers/aiController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * Middleware Global untuk AI Routes
 * Semua endpoint di bawah ini memerlukan header 'Authorization: Bearer <token>'
 */
router.use(verifyToken);

/**
 * @route   POST /api/ai/jurnal-chat
 * @desc    Asisten Riset Jurnal dan Referensi Buku
 */
router.post("/jurnal-chat", chatWithJournalAI);

/**
 * @route   POST /api/ai/process-text
 * @desc    Fitur Grammar Checker, Typo, Parafrase, dan Formalisasi Teks
 */
router.post("/process-text", processGrammarAI);

/**
 * @route   POST /api/ai/check-character-consistency
 * @desc    Analisis AI untuk mengecek konsistensi data tokoh antara naskah vs database
 */
router.post("/check-character-consistency", checkCharacterConsistency);

router.post("/suggest-titles", suggestBookTitles); // atau sesuaikan namanya

export default router;