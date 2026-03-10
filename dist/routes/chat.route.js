"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chat_controller_1 = require("../controllers/chat.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
const chatController = new chat_controller_1.ChatController();
// Admin routes
router.get("/admin/all", auth_middleware_1.authMiddleware, chatController.getAllChats.bind(chatController));
router.get("/admin/users", auth_middleware_1.authMiddleware, chatController.getChatUsers.bind(chatController));
router.get("/admin/user/:userId", auth_middleware_1.authMiddleware, chatController.getUserChat.bind(chatController));
router.post("/admin/user/:userId/send", auth_middleware_1.authMiddleware, chatController.sendAdminMessage.bind(chatController));
// User routes
router.get("/history", auth_middleware_1.authMiddleware, chatController.getChatHistory.bind(chatController));
router.get("/unread-count", auth_middleware_1.authMiddleware, chatController.getUserUnreadCount.bind(chatController));
router.post("/user/send", auth_middleware_1.authMiddleware, chatController.sendUserMessage.bind(chatController));
exports.default = router;
//# sourceMappingURL=chat.route.js.map