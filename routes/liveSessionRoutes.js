import express from "express";
import {
    createLiveSession,
    endLiveSession,
    getAllLiveSessions,
    getLiveSessionById,
    deleteLiveSession
} from "../controllers/liveSessionController.js";
import { uploadPoster } from "../middleware/upload.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.post('/create-live', verifyToken, uploadPoster.single('poster_url'), createLiveSession);
router.patch('/end-live/:id', verifyToken, endLiveSession);

router.get('/all-live', getAllLiveSessions);

router.get('/detail/:id', getLiveSessionById);

router.delete('/delete/:id', verifyToken, deleteLiveSession);

export default router;