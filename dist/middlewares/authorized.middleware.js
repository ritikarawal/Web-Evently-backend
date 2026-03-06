"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminMiddleware = exports.authorizedMiddleware = void 0;
const config_1 = require("../config");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_repository_1 = require("../infrastructure/repositories/user.repository");
const http_error_1 = require("../errors/http-error");
let userRepository = new user_repository_1.UserRepository();
const authorizedMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        console.log('[authorizedMiddleware] authHeader:', authHeader);
        if (!authHeader || !authHeader.startsWith('Bearer '))
            throw new http_error_1.HttpError(401, 'Unauthorized JWT invalid');
        // JWT token should start with "Bearer <token>"
        const token = authHeader.split(' ')[1]; // 0 -> Bearer, 1 -> token
        console.log('[authorizedMiddleware] token:', token ? 'present' : 'missing');
        if (!token)
            throw new http_error_1.HttpError(401, 'Unauthorized JWT missing');
        const decodedToken = jsonwebtoken_1.default.verify(token, config_1.JWT_SECRET);
        console.log('[authorizedMiddleware] decodedToken.id:', decodedToken.id);
        if (!decodedToken || !decodedToken.id) {
            throw new http_error_1.HttpError(401, 'Unauthorized JWT unverified');
        } // make function async
        const user = await userRepository.getUserById(decodedToken.id);
        console.log('[authorizedMiddleware] user found:', !!user);
        if (!user)
            throw new http_error_1.HttpError(401, 'Unauthorized user not found');
        req.user = user; // attach user to request (like tag)
        next();
    }
    catch (err) {
        console.error('[authorizedMiddleware] error:', err.message);
        const isJwtError = err?.name === "JsonWebTokenError" || err?.name === "TokenExpiredError";
        const statusCode = err.statusCode || (isJwtError ? 401 : 500);
        return res.status(statusCode).json({ success: false, message: err.message });
    }
};
exports.authorizedMiddleware = authorizedMiddleware;
const adminMiddleware = (req, res, next) => {
    try {
        console.log('[adminMiddleware] req.user:', req.user ? `${req.user.firstName} (${req.user.role})` : 'missing');
        if (!req.user) {
            console.log('[adminMiddleware] No user found');
            return res.status(401).json({
                success: false,
                message: 'Unauthorized no user info'
            });
        }
        if (req.user.role !== 'admin') {
            console.log('[adminMiddleware] User role is not admin:', req.user.role);
            throw new http_error_1.HttpError(403, 'Forbidden not admin');
        }
        console.log('[adminMiddleware] User is admin, proceeding');
        return next();
    }
    catch (err) {
        console.log('[adminMiddleware] Caught error:', err.message);
        return res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
};
exports.adminMiddleware = adminMiddleware;
//# sourceMappingURL=authorized.middleware.js.map