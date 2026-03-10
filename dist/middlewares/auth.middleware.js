"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminMiddleware = exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const http_error_1 = require("../errors/http-error");
const authMiddleware = (req, res, next) => {
    try {
        console.log('\ud83d\udd11 Auth Middleware - Headers:', req.headers.authorization);
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            console.log('\u274c Auth Middleware - No token found');
            return res.status(401).json({
                success: false,
                message: "No token provided",
            });
        }
        const decoded = jsonwebtoken_1.default.verify(token, config_1.JWT_SECRET);
        req.userId = decoded.id;
        console.log('\u2705 Auth Middleware - User authenticated:', decoded.id);
        next();
    }
    catch (error) {
        console.log('\u274c Auth Middleware - Token verification failed:', error);
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
};
exports.authMiddleware = authMiddleware;
const adminMiddleware = async (req, res, next) => {
    try {
        if (!req.userId) {
            throw new http_error_1.HttpError(401, 'Unauthorized no user info');
        }
        if (req.userId.role !== 'admin') {
            throw new http_error_1.HttpError(403, 'Forbidden not admin');
        }
        return next();
    }
    catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
};
exports.adminMiddleware = adminMiddleware;
//# sourceMappingURL=auth.middleware.js.map