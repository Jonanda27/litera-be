import express from 'express';
import MentorController from '../controllers/mentorController.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// 1. Route ini bisa diakses oleh Mentor (hanya butuh verifyToken)
// Letakkan di paling atas agar tidak tertabrak parameter /:id
router.get('/my-students', verifyToken, MentorController.getMyStudents);
router.post('/send-reminder', verifyToken, MentorController.sendProgressReminder);
router.get("/my-logs", verifyToken, MentorController.getMyMentorLogs);

/**
 * 2. Proteksi Admin untuk route di bawahnya.
 * Semua route setelah baris ini wajib verifyToken DAN isAdmin.
 */
router.use(verifyToken, isAdmin);


// Endpoint RESTful untuk manajemen entitas Mentor (Hanya Admin)
router.get('/', MentorController.getAllMentors);
router.post('/', MentorController.createMentor);
router.get('/:id', MentorController.getMentorById);
router.put('/:id', MentorController.updateMentor);
router.delete('/:id', MentorController.deleteMentor);

export default router;