"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const user_service_1 = require("../services/user/user.service");
const user_dto_1 = require("../dtos/user.dto");
const userService = new user_service_1.UserService();
class AuthController {
    async register(req, res) {
        try {
            // Validate input data
            const validatedData = user_dto_1.CreateUserDTO.parse(req.body);
            // Note: Ensure your service returns { user, token }
            const { user, token } = await userService.register(validatedData);
            return res.status(201).json({
                success: true,
                message: "User registered successfully",
                token: token, // Now returns token on register
                data: user,
            });
        }
        catch (error) {
            if (error.name === 'ZodError') {
                return res.status(400).json({
                    success: false,
                    message: "Validation failed",
                    errors: error.errors,
                });
            }
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Internal server error",
            });
        }
    }
    async login(req, res) {
        try {
            const { user, token } = await userService.login(req.body);
            return res.status(200).json({
                success: true,
                message: "Login successful",
                token: token,
                data: user,
            });
        }
        catch (error) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Internal server error",
            });
        }
    }
    async updateProfilePicture(req, res) {
        try {
            const userId = req.userId;
            console.log(' Profile picture upload request from user:', userId);
            console.log(' File received:', req.file ? 'Yes' : 'No');
            if (!req.file) {
                console.log('❌ No file in request');
                return res.status(400).json({
                    success: false,
                    message: "No file uploaded",
                });
            }
            console.log('✅ File details:', {
                filename: req.file.filename,
                size: req.file.size,
                mimetype: req.file.mimetype,
                path: req.file.path
            });
            const profilePictureUrl = `/uploads/profile-pictures/${req.file.filename}`;
            const user = await userService.updateProfilePicture(userId, profilePictureUrl);
            return res.status(200).json({
                success: true,
                message: "Profile picture updated successfully",
                data: user,
            });
        }
        catch (error) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Internal server error",
            });
        }
    }
    async getProfile(req, res) {
        try {
            const userId = req.userId;
            const user = await userService.getProfile(userId);
            return res.status(200).json({
                success: true,
                message: "Profile fetched successfully",
                data: user,
            });
        }
        catch (error) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Internal server error",
            });
        }
    }
    async updateProfile(req, res) {
        try {
            const userId = req.userId;
            const { firstName, lastName, username, email, phoneNumber, password, } = req.body;
            const updatePayload = {
                firstName,
                lastName,
                username,
                email,
                phoneNumber,
                password,
            };
            const parsedData = user_dto_1.UpdateUserDTO.safeParse(updatePayload);
            if (!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    message: parsedData.error.issues[0]?.message || "Invalid profile data",
                });
            }
            const updatedUser = await userService.updateProfile(userId, parsedData.data);
            return res.status(200).json({
                success: true,
                message: "Profile updated successfully",
                data: updatedUser,
            });
        }
        catch (error) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Internal server error",
            });
        }
    }
    async sendResetPasswordEmail(req, res) {
        try {
            const email = req.body.email;
            const user = await userService.sendResetPasswordEmail(email);
            return res.status(200).json({ success: true,
                data: user,
                message: "If the email is registered, a reset link has been sent." });
        }
        catch (error) {
            console.error("Error in sendResetPasswordEmail:", error);
            return res.status(error.statusCode ?? 500).json({ success: false, message: error.message || "Failed to send reset email. Please try again later." });
        }
    }
    async resetPassword(req, res) {
        try {
            const token = req.params.token;
            const { newPassword } = req.body;
            await userService.resetPassword(token, newPassword);
            return res.status(200).json({ success: true, message: "Password has been reset successfully." });
        }
        catch (error) {
            return res.status(error.statusCode ?? 500).json({ success: false, message: error.message || "Internal Server Error" });
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map