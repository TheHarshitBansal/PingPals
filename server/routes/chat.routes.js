import express from 'express';
import { protect } from '../controllers/user.controller.js';
import { deleteChat, deleteMessage } from '../controllers/chat.controller.js';

const router = express.Router();

router.delete('/delete/:chatId', protect, deleteChat);
router.delete('/delete-message/:chatId/:messageId', protect, deleteMessage);

export default router;