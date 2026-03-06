import { Server as SocketIOServer, Socket } from "socket.io";
import { Server as HTTPServer } from "http";
import mongoose from "mongoose";
import { ChatModel } from "../domain/entities/chat.model";

export class ChatSocketService {
    private io: SocketIOServer;
    private static ioRef: SocketIOServer | null = null;
    private activeUsers: Map<string, string> = new Map(); // userId -> socketId

    constructor(httpServer: HTTPServer) {
        this.io = new SocketIOServer(httpServer, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"],
                credentials: true
            }
        });

        ChatSocketService.ioRef = this.io;

        this.initializeListeners();
    }

    private initializeListeners() {
        this.io.on("connection", (socket: Socket) => {
            console.log(`📱 User connected: ${socket.id}`);

            // User joins chat
            socket.on("join_chat", async (userId: string) => {
                this.activeUsers.set(userId, socket.id);
                socket.join(`user_${userId}`);
                console.log(`✅ User ${userId} joined chat (${socket.id})`);

                // Notify admins that user is online
                this.io.to("admin_room").emit("user_online", {
                    userId,
                    status: "online"
                });
            });

            // Admin joins admin room
            socket.on("join_admin_room", (adminId: string) => {
                socket.join("admin_room");
                socket.join(`admin_${adminId}`);
                console.log(`✅ Admin ${adminId} joined admin room (${socket.id})`);
            });

            // Send message from user to admin
            socket.on("send_user_message", async (data: {
                userId: string;
                message: string;
                username?: string;
                senderName?: string;
            }) => {
                try {
                    // Save to database
                    let chat = await ChatModel.findOne({ userId: data.userId });

                    if (!chat) {
                        chat = new ChatModel({
                            userId: data.userId,
                            messages: []
                        });
                    }

                    chat.messages.push({
                        from: "user",
                        text: data.message,
                        timestamp: new Date(),
                        isRead: false,
                        username: data.username,
                        senderName: data.senderName
                    });

                    await chat.save();

                    // Emit to all admins
                    this.io.to("admin_room").emit("receive_user_message", {
                        userId: data.userId,
                        message: data.message,
                        username: data.username,
                        senderName: data.senderName,
                        timestamp: new Date()
                    });

                    // Also emit to user's own chat
                    socket.emit("message_sent", {
                        message: data.message,
                        timestamp: new Date()
                    });
                } catch (error) {
                    console.error("Error sending user message:", error);
                    socket.emit("error", { message: "Failed to send message" });
                }
            });

            // Send message from admin to user
            socket.on("send_admin_message", async (data: {
                userId: string;
                adminId: string;
                message: string;
                adminName?: string;
            }) => {
                try {
                    const adminObjectId = new mongoose.Types.ObjectId(data.adminId);

                    // Save to database
                    let chat = await ChatModel.findOne({ userId: data.userId });

                    if (!chat) {
                        chat = new ChatModel({
                            userId: data.userId,
                            adminId: adminObjectId,
                            messages: []
                        });
                    } else {
                        chat.adminId = adminObjectId;
                    }

                    chat.messages.push({
                        from: "admin",
                        text: data.message,
                        timestamp: new Date(),
                        isRead: true,
                        senderName: data.adminName
                    });

                    await chat.save();

                    // Send to specific user
                    const userSocketId = this.activeUsers.get(data.userId);
                    if (userSocketId) {
                        this.io.to(`user_${data.userId}`).emit("receive_admin_message", {
                            message: data.message,
                            adminName: data.adminName,
                            timestamp: new Date()
                        });
                    }

                    // Confirm to admin
                    socket.emit("message_sent", {
                        message: data.message,
                        timestamp: new Date()
                    });
                } catch (error) {
                    console.error("Error sending admin message:", error);
                    socket.emit("error", { message: "Failed to send message" });
                }
            });

            // Get chat history for user
            socket.on("get_chat_history", async (userId: string) => {
                try {
                    const chat = await ChatModel.findOne({ userId });
                    if (chat) {
                        socket.emit("chat_history", chat.messages);
                    } else {
                        socket.emit("chat_history", []);
                    }
                } catch (error) {
                    console.error("Error fetching chat history:", error);
                    socket.emit("error", { message: "Failed to fetch chat history" });
                }
            });

            // Get all chats for admin
            socket.on("get_all_chats", async () => {
                try {
                    const chats = await ChatModel.find()
                        .populate("userId", "firstName lastName username email profilePicture")
                        .sort({ updatedAt: -1 });

                    socket.emit("all_chats", chats);
                } catch (error) {
                    console.error("Error fetching all chats:", error);
                    socket.emit("error", { message: "Failed to fetch chats" });
                }
            });

            // Get specific chat for admin
            socket.on("get_user_chat", async (userId: string) => {
                try {
                    const chat = await ChatModel.findOne({ userId }).populate(
                        "userId",
                        "firstName lastName username email profilePicture"
                    );

                    if (chat) {
                        socket.emit("user_chat", chat);
                    } else {
                        socket.emit("user_chat", null);
                    }
                } catch (error) {
                    console.error("Error fetching user chat:", error);
                    socket.emit("error", { message: "Failed to fetch chat" });
                }
            });

            // Disconnect handler
            socket.on("disconnect", () => {
                // Find and remove user
                for (const [userId, socketId] of this.activeUsers.entries()) {
                    if (socketId === socket.id) {
                        this.activeUsers.delete(userId);
                        console.log(`❌ User ${userId} disconnected`);

                        // Notify admins
                        this.io.to("admin_room").emit("user_offline", {
                            userId,
                            status: "offline"
                        });
                        break;
                    }
                }

                console.log(`📱 Socket disconnected: ${socket.id}`);
            });

            // Error handler
            socket.on("error", (error) => {
                console.error(`Socket error for ${socket.id}:`, error);
            });
        });
    }

    getIO(): SocketIOServer {
        return this.io;
    }

    static emitUserMessageToAdmins(payload: {
        userId: string;
        message: string;
        username?: string;
        senderName?: string;
        timestamp: Date;
    }) {
        if (!ChatSocketService.ioRef) return;
        ChatSocketService.ioRef.to("admin_room").emit("receive_user_message", payload);
    }

    static emitAdminMessageToUser(
        userId: string,
        payload: { message: string; adminName?: string; timestamp: Date }
    ) {
        if (!ChatSocketService.ioRef) return;
        ChatSocketService.ioRef.to(`user_${userId}`).emit("receive_admin_message", payload);
    }
}
