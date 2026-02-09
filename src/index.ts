import express from "express";
import path from "path";
import { connectDatabase } from "./database/mongodb";
import authRoutes from "./routes/auth.route";
import { AuthController } from "./controllers/auth.controller";
import { authMiddleware } from "./middlewares/auth.middleware";
import eventRoutes from "./routes/event.route";
import { PORT } from "./config";
import cors from "cors";
import userRoutes from "./routes/admin/user.routes";
import adminEventRoutes from "./routes/admin/event.routes";
import notificationRoutes from "./routes/notification.routes";

const app = express();
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
app.use("/api/admin/users", userRoutes);
app.use("/api/admin/events", adminEventRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/", (_, res) => {
    res.status(200).json({
        success: true,
        message: "Welcome to Evently"
    });
});

async function startServer() {
    await connectDatabase();

    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

startServer();
