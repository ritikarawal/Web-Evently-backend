"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminUserService = void 0;
const user_repository_1 = require("../../infrastructure/repositories/user.repository");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const http_error_1 = require("../../errors/http-error");
let userRepository = new user_repository_1.UserRepository();
class AdminUserService {
    async createUser(data) {
        const emailCheck = await userRepository.getUserByEmail(data.email);
        if (emailCheck) {
            throw new http_error_1.HttpError(403, "Email already in use");
        }
        const usernameCheck = await userRepository.getUserByUsername(data.username);
        if (usernameCheck) {
            throw new http_error_1.HttpError(403, "Username already in use");
        }
        // hash password
        const hashedPassword = await bcryptjs_1.default.hash(data.password, 10); // 10 - complexity
        data.password = hashedPassword;
        const newUser = await userRepository.createUser(data);
        return newUser;
    }
    async getAllUsers() {
        const users = await userRepository.getAllUsers();
        return users;
    }
    async getAdminUsers() {
        const admins = await userRepository.getAdminUsers();
        return admins;
    }
    async getUsersPaginated(data) {
        const { page, limit } = data;
        const result = await userRepository.getUsersPaginated(page, limit);
        return result;
    }
    async deleteUser(id) {
        const user = await userRepository.getUserById(id);
        if (!user) {
            throw new http_error_1.HttpError(404, "User not found");
        }
        const deleted = await userRepository.deleteUser(id);
        return deleted;
    }
    async updateUser(id, updateData) {
        const user = await userRepository.getUserById(id);
        if (!user) {
            throw new http_error_1.HttpError(404, "User not found");
        }
        if (updateData.password) {
            updateData.password = await bcryptjs_1.default.hash(updateData.password, 10);
        }
        const updatedUser = await userRepository.updateUser(id, updateData);
        return updatedUser;
    }
    async getUserById(id) {
        const user = await userRepository.getUserById(id);
        if (!user) {
            throw new http_error_1.HttpError(404, "User not found");
        }
        return user;
    }
}
exports.AdminUserService = AdminUserService;
//# sourceMappingURL=user.service.js.map