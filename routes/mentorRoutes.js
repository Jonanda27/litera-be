import express from 'express';
import MentorController from '../controllers/mentorController.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

/**
 * Menerapkan High Cohesion pada keamanan rute.
 * Penggunaan `router.use()` di tingkat atas memastikan semua endpoint 
 * di bawahnya secara otomatis terproteksi oleh middleware otentikasi & RBAC.
 */
router.use(verifyToken, isAdmin);

// Endpoint RESTful untuk entitas Mentor
router.get('/', MentorController.getAllMentors);
router.get('/:id', MentorController.getMentorById);
router.post('/', MentorController.createMentor);
router.put('/:id', MentorController.updateMentor);
router.delete('/:id', MentorController.deleteMentor);

export default router;