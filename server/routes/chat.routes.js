import express from 'express';
import { protect } from '../controllers/user.controller.js';
import { deleteChat, deleteMessage } from '../controllers/chat.controller.js';
import { upload } from '../middlewares/upload.middleware.js';

const router = express.Router();

router.delete('/delete/:chatId', protect, deleteChat);
router.delete('/delete-message/:chatId/:messageId', protect, deleteMessage);
router.post("/upload/file", upload.single('file'), (req, res) => {
  if (!req.file || req.file.length === 0) {
    return res.status(400).json({ message: "No files uploaded" });
  }
  res.json({ message: "Files uploaded successfully", file: req.file });
});

export default router;