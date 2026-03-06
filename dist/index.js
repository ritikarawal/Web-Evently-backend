"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const net_1 = __importDefault(require("net"));
const http_1 = require("http");
const mongodb_1 = require("./database/mongodb");
const auth_route_1 = __importDefault(require("./routes/auth.route"));
const auth_controller_1 = require("./controllers/auth.controller");
const auth_middleware_1 = require("./middlewares/auth.middleware");
const event_route_1 = __importDefault(require("./routes/event.route"));
const venue_route_1 = __importDefault(require("./routes/venue.route"));
const config_1 = require("./config");
const cors_1 = __importDefault(require("cors"));
const user_routes_1 = __importDefault(require("./routes/admin/user.routes"));
const event_routes_1 = __importDefault(require("./routes/admin/event.routes"));
const notification_routes_1 = __importDefault(require("./routes/notification.routes"));
const payment_routes_1 = __importDefault(require("./routes/payment.routes"));
const chat_route_1 = __importDefault(require("./routes/chat.route"));
const chat_service_1 = require("./services/chat.service");
const app = (0, express_1.default)();
exports.app = app;
const httpServer = (0, http_1.createServer)(app);
const chatSocketService = new chat_service_1.ChatSocketService(httpServer);
const authController = new auth_controller_1.AuthController();
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: '*', // Allow all origins for development
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
// Serve uploaded files statically with logging
const uploadsPath = path_1.default.join(__dirname, "../uploads");
console.log('📁 Serving static files from:', uploadsPath);
app.use("/uploads", express_1.default.static(uploadsPath));
// Log static file requests
app.use("/uploads", (req, res, next) => {
    console.log('🖼️  Static file request:', req.url);
    next();
});
app.use("/api/auth", auth_route_1.default);
app.get("/api/auth/profile", auth_middleware_1.authMiddleware, authController.getProfile.bind(authController));
app.use("/api/events", event_route_1.default);
app.use("/api/venues", venue_route_1.default);
app.use("/api/admin/users", user_routes_1.default);
app.use("/api/admin/events", event_routes_1.default);
app.use("/api/chat", chat_route_1.default);
app.use("/api/notifications", notification_routes_1.default);
app.use("/api/payments", payment_routes_1.default);
app.get("/", (_, res) => {
    res.status(200).json({
        success: true,
        message: "Welcome to Evently"
    });
});
function isPortInUse(port) {
    return new Promise((resolve) => {
        const tester = net_1.default.createServer()
            .once("error", (error) => {
            if (error.code === "EADDRINUSE") {
                resolve(true);
            }
            else {
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
    await (0, mongodb_1.connectDatabase)();
    let portToUse = Number(config_1.PORT) || 5050;
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
//# sourceMappingURL=index.js.map