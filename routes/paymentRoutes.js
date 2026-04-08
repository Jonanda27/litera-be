import express from 'express';
import { checkout, createPaymentToken, midtransWebhook } from '../controllers/paymentController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Route versi awal (checkout simpel)
router.post('/checkout', verifyToken, checkout);

// [TAMBAHAN] Route untuk mendapatkan Snap Token (digunakan oleh Frontend Get Premium)
router.post('/create-token', verifyToken, createPaymentToken);

// Webhook harus publik (tanpa middleware auth)
router.post('/notification', midtransWebhook);

export default router;
