import express from 'express';
import { protect } from '../controllers/user.controller.js';
import { generateZegoToken, getLogs, startCall } from '../controllers/call.controller.js';

const router = express.Router();

router.post('/generate-zego-token', protect, generateZegoToken);
router.get('/logs', protect, getLogs);
router.post('/new-call', protect, startCall);

export default router;