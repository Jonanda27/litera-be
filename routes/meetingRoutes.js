import express from "express";
import {
    createMeeting,
    getAllMeetings,
    getMeetingById,
    endMeeting,
    startDiscussionMeeting,
    endDiscussionMeeting,
    getDiscussionDetails
} from "../controllers/meetingController.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.post('/create-meeting', verifyToken, createMeeting);
router.get('/all-meetings', getAllMeetings);
router.get('/get-meeting/:id', getMeetingById);
router.patch('/end-meeting/:roomName', verifyToken, endMeeting);

router.post(
    '/create-meeting/:id/start-meeting',
    verifyToken, startDiscussionMeeting
);

router.patch(
    '/discussions/:id/end-meeting',
    verifyToken, endDiscussionMeeting
);

router.get(
    '/discussions/:id',
    verifyToken, getDiscussionDetails
);

export default router;