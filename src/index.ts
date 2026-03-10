import express from "express";
import path from "path";
import net from "net";
import { createServer } from "http";
import { connectDatabase } from "./database/mongodb";
import authRoutes from "./routes/auth.route";
import { AuthController } from "./controllers/auth.controller";
import { authMiddleware } from "./middlewares/auth.middleware";
import eventRoutes from "./routes/event.route";
import venueRoutes from "./routes/venue.route";
import { PORT } from "./config";
import cors from "cors";
import userRoutes from "./routes/admin/user.routes";
import adminEventRoutes from "./routes/admin/event.routes";
import notificationRoutes from "./routes/notification.routes";
import paymentRoutes from "./routes/payment.routes";
import chatRoutes from "./routes/chat.route";
import { ChatSocketService } from "./services/chat.service";

const app = express();
const httpServer = createServer(app);
const chatSocketService = new ChatSocketService(httpServer);
const authController = new AuthController();

app.use(express.json());
app.use(cors({
  origin: '*', // Allow all origins for development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Serve uploaded files statically with logging
const uploadsPath = path.join(__dirname, "../uploads");
console.log('📁 Serving static files from:', uploadsPath);
app.use("/uploads", express.static(uploadsPath));

// Log static file requests
app.use("/uploads", (req, res, next) => {
  console.log('🖼️  Static file request:', req.url);
  next();
});

app.use("/api/auth", authRoutes);
app.get("/api/auth/profile", authMiddleware, authController.getProfile.bind(authController));
app.use("/api/events", eventRoutes);
app.use("/api/venues", venueRoutes);
app.use("/api/admin/users", userRoutes);
app.use("/api/admin/events", adminEventRoutes);
app.use("/api/chat", chatRoutes);

app.use("/api/notifications", notificationRoutes);

app.use("/api/payments", paymentRoutes);

app.get("/", (_, res) => {
    res.status(200).json({
        success: true,
        message: "Welcome to Evently"
    });
});

function isPortInUse(port: number): Promise<boolean> {
    return new Promise((resolve) => {
        const tester = net.createServer()
            .once("error", (error: NodeJS.ErrnoException) => {
                if (error.code === "EADDRINUSE") {
                    resolve(true);
                } else {
                    resolve(false);
                }
            })
            .once("listening", () => {
                tester.close(() => resolve(false));
            })
            .listen(port, "0.0.0.0");
    });
}

async function startServer() {
    await connectDatabase();

    let portToUse = Number(PORT) || 5050;
    while (await isPortInUse(portToUse)) {
        console.warn(`⚠️ Port ${portToUse} is already in use. Trying ${portToUse + 1}...`);
        portToUse += 1;
    }

    httpServer.listen(portToUse, '0.0.0.0', () => {
        console.log(`✅ Server running on port ${portToUse}`);
        console.log(`📱 For Flutter app: http:// 10.1.6.169:${portToUse}`);
        console.log(`🌐 For Web/Local: http://localhost:${portToUse}`);
        console.log(`🔌 Socket.io initialized for real-time chat`);
    });
}

// Only start server if this file is run directly (not imported for testing)
if (require.main === module) {
    startServer();
}

export { app };