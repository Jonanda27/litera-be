import express from "express";
import {
    createMeeting,
    getAllMeetings,
    getMeetingById,
    endMeeting
} from "../controllers/meetingController.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.post('/create-meeting', verifyToken, createMeeting);
router.get('/all-meetings', getAllMeetings);
router.get('/get-meeting/:id', getMeetingById);
router.patch('/end-meeting/:roomName', verifyToken, endMeeting);

export default router;