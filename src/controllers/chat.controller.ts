import { Request, Response } from "express";
import mongoose from "mongoose";
import { ChatModel } from "../domain/entities/chat.model";
import { ChatSocketService } from "../services/chat.service";

export class ChatController {
    // Get all chats for admin
    async getAllChats(req: Request, res: Response) {
        try {
            const chats = await ChatModel.find()
                .populate("userId", "firstName lastName username email profilePicture")
                .sort({ updatedAt: -1 });

            return res.status(200).json({
                success: true,
                message: "All chats fetched successfully",
                data: chats,
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: error.message || "Failed to fetch chats",
            });
        }
    }

    // Get chat for a specific user
    async getUserChat(req: Request, res: Response) {
        try {
            const { userId } = req.params;

            const chat = await ChatModel.findOne({ userId })
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
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: error.message || "Failed to fetch chat",
            });
        }
    }

    // Get chat history for user
    async getChatHistory(req: Request, res: Response) {
        try {
            const userId = (req as any).userId;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                });
            }

            const chat = await ChatModel.findOne({ userId });

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
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: error.message || "Failed to fetch chat history",
            });
        }
    }

    // Get list of users who have chatted
    async getChatUsers(req: Request, res: Response) {
        try {
            const chats = await ChatModel.find()
                .populate("userId", "firstName lastName username email profilePicture")
                .sort({ updatedAt: -1 });

            const users = chats.map(chat => {
                const populatedUser = chat.userId as any;
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
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: error.message || "Failed to fetch chat users",
            });
        }
    }

    async sendUserMessage(req: Request, res: Response) {
        try {
            const userId = (req as any).userId;
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

            let chat = await ChatModel.findOne({ userId });

            if (!chat) {
                chat = new ChatModel({ userId, messages: [] });
            }

            const message = {
                from: "user" as const,
                text: String(text).trim(),
                timestamp: new Date(),
                isRead: false,
                username,
                senderName,
            };

            chat.messages.push(message);
            await chat.save();

            ChatSocketService.emitUserMessageToAdmins({
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
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: error.message || "Failed to send message",
            });
        }
    }

    async sendAdminMessage(req: Request, res: Response) {
        try {
            const adminId = (req as any).userId;
            const { userId } = req.params;
            const { text, adminName } = req.body;

            if (!adminId) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                });
            }

            if (!mongoose.Types.ObjectId.isValid(userId)) {
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

            let chat = await ChatModel.findOne({ userId });

            if (!chat) {
                chat = new ChatModel({
                    userId,
                    adminId: new mongoose.Types.ObjectId(adminId),
                    messages: [],
                });
            } else {
                chat.adminId = new mongoose.Types.ObjectId(adminId);
            }

            const message = {
                from: "admin" as const,
                text: String(text).trim(),
                timestamp: new Date(),
                isRead: true,
                senderName: adminName,
            };

            chat.messages.push(message);
            await chat.save();

            ChatSocketService.emitAdminMessageToUser(String(userId), {
                message: message.text,
                adminName: message.senderName,
                timestamp: message.timestamp,
            });

            return res.status(201).json({
                success: true,
                message: "Message sent",
                data: message,
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: error.message || "Failed to send message",
            });
        }
    }
}
