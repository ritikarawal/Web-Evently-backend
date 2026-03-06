"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatController = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const chat_model_1 = require("../domain/entities/chat.model");
const chat_service_1 = require("../services/chat.service");
class ChatController {
    // Get all chats for admin
    async getAllChats(req, res) {
        try {
            const chats = await chat_model_1.ChatModel.find()
                .populate("userId", "firstName lastName username email profilePicture")
                .sort({ updatedAt: -1 });
            return res.status(200).json({
                success: true,
                message: "All chats fetched successfully",
                data: chats,
            });
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message || "Failed to fetch chats",
            });
        }
    }
    // Get chat for a specific user
    async getUserChat(req, res) {
        try {
            const { userId } = req.params;
            const chat = await chat_model_1.ChatModel.findOne({ userId })
                .populate("userId", "firstName lastName username email profilePicture");
            if (!chat) {
                return res.status(200).json({
                    success: true,
                    message: "No chat found for this user",
                    data: null,
                });
            }
            let hasUnreadMessages = false;
            for (const message of chat.messages) {
                if (message.from === "user" && !message.isRead) {
                    message.isRead = true;
                    hasUnreadMessages = true;
                }
            }
            if (hasUnreadMessages) {
                await chat.save();
            }
            return res.status(200).json({
                success: true,
                message: "Chat fetched successfully",
                data: {
                    _id: chat._id,
                    userId: chat.userId,
                    messages: chat.messages,
                    createdAt: chat.createdAt,
                    updatedAt: chat.updatedAt,
                },
            });
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message || "Failed to fetch chat",
            });
        }
    }
    // Get chat history for user
    async getChatHistory(req, res) {
        try {
            const userId = req.userId;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                });
            }
            const chat = await chat_model_1.ChatModel.findOne({ userId });
            if (!chat) {
                return res.status(200).json({
                    success: true,
                    message: "No chat history found",
                    data: [],
                });
            }
            return res.status(200).json({
                success: true,
                message: "Chat history fetched successfully",
                data: chat.messages,
            });
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message || "Failed to fetch chat history",
            });
        }
    }
    // Get list of users who have chatted
    async getChatUsers(req, res) {
        try {
            const chats = await chat_model_1.ChatModel.find()
                .populate("userId", "firstName lastName username email profilePicture")
                .sort({ updatedAt: -1 });
            const users = chats.map(chat => {
                const populatedUser = chat.userId;
                const userData = populatedUser?.toObject ? populatedUser.toObject() : populatedUser;
                return {
                    ...userData,
                    lastMessage: chat.messages[chat.messages.length - 1]?.text,
                    lastMessageTime: chat.messages[chat.messages.length - 1]?.timestamp,
                    messageCount: chat.messages.length,
                    unreadCount: chat.messages.filter(msg => msg.from === "user" && !msg.isRead).length
                };
            });
            return res.status(200).json({
                success: true,
                message: "Chat users fetched successfully",
                data: users,
            });
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message || "Failed to fetch chat users",
            });
        }
    }
    async sendUserMessage(req, res) {
        try {
            const userId = req.userId;
            const { text, username, senderName } = req.body;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                });
            }
            if (!text || !String(text).trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Message text is required",
                });
            }
            let chat = await chat_model_1.ChatModel.findOne({ userId });
            if (!chat) {
                chat = new chat_model_1.ChatModel({ userId, messages: [] });
            }
            const message = {
                from: "user",
                text: String(text).trim(),
                timestamp: new Date(),
                isRead: false,
                username,
                senderName,
            };
            chat.messages.push(message);
            await chat.save();
            chat_service_1.ChatSocketService.emitUserMessageToAdmins({
                userId: String(userId),
                message: message.text,
                username: message.username,
                senderName: message.senderName,
                timestamp: message.timestamp,
            });
            return res.status(201).json({
                success: true,
                message: "Message sent",
                data: message,
            });
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message || "Failed to send message",
            });
        }
    }
    async sendAdminMessage(req, res) {
        try {
            const adminId = req.userId;
            const { userId } = req.params;
            const { text, adminName } = req.body;
            if (!adminId) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                });
            }
            if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid user id",
                });
            }
            if (!text || !String(text).trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Message text is required",
                });
            }
            let chat = await chat_model_1.ChatModel.findOne({ userId });
            if (!chat) {
                chat = new chat_model_1.ChatModel({
                    userId,
                    adminId: new mongoose_1.default.Types.ObjectId(adminId),
                    messages: [],
                });
            }
            else {
                chat.adminId = new mongoose_1.default.Types.ObjectId(adminId);
            }
            const message = {
                from: "admin",
                text: String(text).trim(),
                timestamp: new Date(),
                isRead: true,
                senderName: adminName,
            };
            chat.messages.push(message);
            await chat.save();
            chat_service_1.ChatSocketService.emitAdminMessageToUser(String(userId), {
                message: message.text,
                adminName: message.senderName,
                timestamp: message.timestamp,
            });
            return res.status(201).json({
                success: true,
                message: "Message sent",
                data: message,
            });
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message || "Failed to send message",
            });
        }
    }
}
exports.ChatController = ChatController;
//# sourceMappingURL=chat.controller.js.map