import express from 'express';
import {upload} from '../middlewares/upload.middleware.js';
import { changePassword, forgotPassword, getFriends, getRequests, login, protect, register, resetPassword, sendOTP, updateProfile, verifyOTP } from '../controllers/user.controller.js';

const router = express.Router();

router.post('/register', register);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.patch('/update-user', protect, upload.single('avatar'), updateProfile)
router.patch('/update-password', protect, changePassword);
router.get('/get-friends', protect, getFriends);
router.get('/get-requests', protect, getRequests);

export default router;