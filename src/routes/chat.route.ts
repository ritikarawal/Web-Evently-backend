import { Router } from "express";
import { ChatController } from "../controllers/chat.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();
const chatController = new ChatController();

// Admin routes
router.get("/admin/all", authMiddleware, chatController.getAllChats.bind(chatController));
router.get("/admin/users", authMiddleware, chatController.getChatUsers.bind(chatController));
router.get("/admin/user/:userId", authMiddleware, chatController.getUserChat.bind(chatController));
router.post("/admin/user/:userId/send", authMiddleware, chatController.sendAdminMessage.bind(chatController));

// User routes
router.get("/history", authMiddleware, chatController.getChatHistory.bind(chatController));
router.post("/user/send", authMiddleware, chatController.sendUserMessage.bind(chatController));

export default router;
