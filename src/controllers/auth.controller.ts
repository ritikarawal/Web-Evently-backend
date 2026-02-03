import { Request, Response } from "express";
import { UserService } from "../services/user.service";
import { UpdateUserDTO } from "../dtos/user.dto";

const userService = new UserService();

export class AuthController {
    async register(req: Request, res: Response) {
        try {
            // Note: Ensure your service returns { user, token }
            const { user, token } = await userService.register(req.body);

            return res.status(201).json({
                success: true,
                message: "User registered successfully",
                token: token, // Now returns token on register
                data: user,
            });
        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Internal server error",
            });
        }
    }

    async login(req: Request, res: Response) {
        try {
            const { user, token } = await userService.login(req.body);

            return res.status(200).json({
                success: true,
                message: "Login successful",
                token: token,
                data: user,
            });
        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Internal server error",
            });
        }
    }

    async updateProfilePicture(req: Request, res: Response) {
        try {
            const userId = (req as any).userId;
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
        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Internal server error",
            });
        }
    }

    async getProfile(req: Request, res: Response) {
        try {
            const userId = (req as any).userId;
            const user = await userService.getProfile(userId);

            return res.status(200).json({
                success: true,
                message: "Profile fetched successfully",
                data: user,
            });
        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Internal server error",
            });
        }
    }

    async updateProfile(req: Request, res: Response) {
        try {
            const userId = (req as any).userId;
            const {
                firstName,
                lastName,
                username,
                email,
                phoneNumber,
                password,
            } = req.body;

            const updatePayload = {
                firstName,
                lastName,
                username,
                email,
                phoneNumber,
                password,
            };

            const parsedData = UpdateUserDTO.safeParse(updatePayload);
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
        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Internal server error",
            });
        }
    }
}