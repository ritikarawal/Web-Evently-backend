"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminUserController = void 0;
const user_dto_1 = require("../../dtos/user.dto");
const zod_1 = __importDefault(require("zod"));
const user_service_1 = require("../../services/admin/user.service");
let adminUserService = new user_service_1.AdminUserService();
const sanitizeUser = (user) => {
    if (!user)
        return user;
    const obj = typeof user.toObject === "function" ? user.toObject() : { ...user };
    delete obj.password;
    return obj;
};
class AdminUserController {
    async createUser(req, res, next) {
        try {
            const parsedData = user_dto_1.CreateUserDTO.safeParse(req.body); // validate request body
            if (!parsedData.success) { // validation failed
                return res.status(400).json({ success: false, message: zod_1.default.prettifyError(parsedData.error) });
            }
            if (req.file) {
                parsedData.data.profilePicture = `/uploads/profile-pictures/${req.file.filename}`;
            }
            const userData = parsedData.data;
            const newUser = await adminUserService.createUser(userData);
            return res.status(201).json({ success: true, message: "User Created", data: sanitizeUser(newUser) });
        }
        catch (error) {
            return res.status(error.statusCode ?? 500).json({ success: false, message: error.message || "Internal Server Error" });
        }
    }
    async getAllUsers(req, res, next) {
        try {
            console.log('[AdminUserController.getAllUsers] Starting fetch');
            const parsedData = user_dto_1.GetUsersDTO.safeParse(req.query);
            if (!parsedData.success) {
                return res.status(400).json({ success: false, message: zod_1.default.prettifyError(parsedData.error) });
            }
            const { page, limit } = parsedData.data;
            const result = await adminUserService.getUsersPaginated({ page, limit });
            console.log('[AdminUserController.getAllUsers] Found', result.users.length, 'users out of', result.total);
            const sanitizedUsers = result.users.map((user) => sanitizeUser(user));
            return res.status(200).json({
                success: true,
                data: sanitizedUsers,
                pagination: {
                    currentPage: result.currentPage,
                    totalPages: result.totalPages,
                    totalUsers: result.total,
                    limit: limit
                },
                message: "Users Retrieved"
            });
        }
        catch (error) {
            console.error('[AdminUserController.getAllUsers] Error:', error.message);
            return res.status(error.statusCode ?? 500).json({ success: false, message: error.message || "Internal Server Error" });
        }
    }
    async updateUser(req, res, next) {
        try {
            const userId = req.params.id;
            const parsedData = user_dto_1.UpdateUserDTO.safeParse(req.body); // validate request body
            if (!parsedData.success) { // validation failed
                return res.status(400).json({ success: false, message: zod_1.default.prettifyError(parsedData.error) });
            }
            if (req.file) {
                parsedData.data.profilePicture = `/uploads/profile-pictures/${req.file.filename}`;
            }
            const updateData = parsedData.data;
            const updatedUser = await adminUserService.updateUser(userId, updateData);
            return res.status(200).json({ success: true, message: "User Updated", data: sanitizeUser(updatedUser) });
        }
        catch (error) {
            return res.status(error.statusCode ?? 500).json({ success: false, message: error.message || "Internal Server Error" });
        }
    }
    async deleteUser(req, res, next) {
        try {
            const userId = req.params.id;
            const deleted = await adminUserService.deleteUser(userId);
            if (!deleted) {
                return res.status(404).json({ success: false, message: "User not found" });
            }
            return res.status(200).json({ success: true, message: "User Deleted" });
        }
        catch (error) {
            return res.status(error.statusCode ?? 500).json({ success: false, message: error.message || "Internal Server Error" });
        }
    }
    async getUserById(req, res, next) {
        try {
            const userId = req.params.id;
            const user = await adminUserService.getUserById(userId);
            return res.status(200).json({ success: true, data: sanitizeUser(user), message: "Single User Retrieved" });
        }
        catch (error) {
            return res.status(error.statusCode ?? 500).json({ success: false, message: error.message || "Internal Server Error" });
        }
    }
}
exports.AdminUserController = AdminUserController;
//# sourceMappingURL=user.controller.js.map