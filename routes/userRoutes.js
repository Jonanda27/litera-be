import express from 'express';
import UserController from '../controllers/userController.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

/**
 * Sama seperti mentor, akses logikal untuk manajemen pengguna 
 * diisolasi secara ketat hanya untuk Admin.
 */
router.use(verifyToken, isAdmin);

// Endpoint RESTful untuk entitas User
router.get('/', UserController.getAllUsers);
router.get('/:id', UserController.getUserById);
router.post('/', UserController.createUser);
router.put('/:id', UserController.updateUser);
router.delete('/:id', UserController.deleteUser);

export default router;