import express from 'express';
import { forgotPassword, login, protect, register, resetPassword, sendOTP, updateProfile, verifyOTP } from '../controllers/user.controller.js';

const router = express.Router();

router.post('/register', register);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:resetToken', resetPassword);
router.patch('/update-user', protect, updateProfile)

export default router;