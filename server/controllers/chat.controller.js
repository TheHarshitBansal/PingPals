import asyncHandler from "../middlewares/asyncHandler.middleware.js";
import Message from "../models/message.model.js";

//INFO: Delete Chat
export const deleteChat = asyncHandler(async (req, res) => {
  const chat = await Message.findByIdAndDelete(req.params.chatId);

  if(!chat) {
    res.status(404);
    throw new Error("Chat not found");
  }

    res.status(200).json({ message: "Chat deleted" });
});

//INFO: Delete Message
export const deleteMessage = asyncHandler(async (req, res) => {
    const { chatId, messageId } = req.params;
  
    // Find the chat document
    const chat = await Message.findById(chatId);
    if (!chat) {
      res.status(404);
      throw new Error("Chat not found");
    }
  
    // Remove the message using MongoDB's $pull operator
    const updatedChat = await Message.findByIdAndUpdate(
      chatId,
      { $pull: { messages: { _id: messageId } } },
      { new: true }
    );
  
    if (!updatedChat) {
      res.status(404);
      throw new Error("Message not found or already deleted");
    }
  
    res.status(200).json({ message: "Message deleted successfully" });
  });