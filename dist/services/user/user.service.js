"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const user_repository_1 = require("../../infrastructure/repositories/user.repository");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../../config");
const http_error_1 = require("../../errors/http-error");
const email_1 = require("../../config/email");
const CLIENT_URL = process.env.CLIENT_URL;
const userRepo = new user_repository_1.UserRepository();
class UserService {
    async register(data) {
        const emailExists = await userRepo.getUserByEmail(data.email);
        if (emailExists) {
            throw new http_error_1.HttpError(400, "Email already exists");
        }
        const usernameExists = await userRepo.getUserByUsername(data.username);
        if (usernameExists) {
            throw new http_error_1.HttpError(400, "Username already exists");
        }
        const hashedPassword = await bcryptjs_1.default.hash(data.password, 10);
        const user = await userRepo.createUser({
            ...data,
            password: hashedPassword,
        });
        const token = jsonwebtoken_1.default.sign({ id: user._id, role: user.role }, config_1.JWT_SECRET, { expiresIn: "30d" });
        const userObject = user.toObject();
        delete userObject.password;
        return { token, user: userObject };
    }
    async login(data) {
        const user = await userRepo.getUserByEmail(data.email);
        if (!user) {
            throw new http_error_1.HttpError(404, "User not found");
        }
        const validPassword = await bcryptjs_1.default.compare(data.password, user.password);
        if (!validPassword) {
            throw new http_error_1.HttpError(401, "Invalid credentials");
        }
        const token = jsonwebtoken_1.default.sign({ id: user._id, role: user.role }, config_1.JWT_SECRET, { expiresIn: "30d" });
        const userObject = user.toObject();
        delete userObject.password;
        return { token, user: userObject };
    }
    async updateProfilePicture(userId, profilePictureUrl) {
        const user = await userRepo.updateUser(userId, {
            profilePicture: profilePictureUrl,
        });
        if (!user) {
            throw new http_error_1.HttpError(404, "User not found");
        }
        return user;
    }
    async getProfile(userId) {
        const user = await userRepo.getUserById(userId);
        if (!user) {
            throw new http_error_1.HttpError(404, "User not found");
        }
        const userObject = user.toObject();
        delete userObject.password;
        return userObject;
    }
    async updateProfile(userId, data) {
        const existingUser = await userRepo.getUserById(userId);
        if (!existingUser) {
            throw new http_error_1.HttpError(404, "User not found");
        }
        if (data.email && data.email !== existingUser.email) {
            const emailExists = await userRepo.getUserByEmail(data.email);
            if (emailExists) {
                throw new http_error_1.HttpError(400, "Email already exists");
            }
        }
        if (data.username && data.username !== existingUser.username) {
            const usernameExists = await userRepo.getUserByUsername(data.username);
            if (usernameExists) {
                throw new http_error_1.HttpError(400, "Username already exists");
            }
        }
        const updateData = Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined));
        if (data.password) {
            updateData.password = await bcryptjs_1.default.hash(data.password, 10);
        }
        const updatedUser = await userRepo.updateUser(userId, updateData);
        if (!updatedUser) {
            throw new http_error_1.HttpError(404, "User not found");
        }
        const userObject = updatedUser.toObject();
        delete userObject.password;
        return userObject;
    }
    async sendResetPasswordEmail(email) {
        console.log(`Password reset requested for email: ${email}`);
        if (!email) {
            throw new http_error_1.HttpError(400, "Email is required");
        }
        const user = await userRepo.getUserByEmail(email);
        if (!user) {
            console.log(`User not found for email: ${email}`);
            throw new http_error_1.HttpError(404, "User not found");
        }
        console.log(`User found: ${user.email}, generating reset token`);
        const token = jsonwebtoken_1.default.sign({ id: user._id }, config_1.JWT_SECRET, { expiresIn: '1h' }); // 1 hour expiry
        const resetLink = `${CLIENT_URL}/reset-password?token=${token}`;
        const html = `<p>Click <a href="${resetLink}">here</a> to reset your password. This link will expire in 1 hour.</p>`;
        await (0, email_1.sendEmail)(user.email, "Password Reset", html);
        return user;
    }
    async resetPassword(token, newPassword) {
        try {
            if (!token || !newPassword) {
                throw new http_error_1.HttpError(400, "Token and new password are required");
            }
            const decoded = jsonwebtoken_1.default.verify(token, config_1.JWT_SECRET);
            const userId = decoded.id;
            const user = await userRepo.getUserById(userId);
            if (!user) {
                throw new http_error_1.HttpError(404, "User not found");
            }
            const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
            await userRepo.updateUser(userId, { password: hashedPassword });
            return user;
        }
        catch (error) {
            throw new http_error_1.HttpError(400, "Invalid or expired token");
        }
    }
}
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map