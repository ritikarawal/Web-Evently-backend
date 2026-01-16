import { Request, Response } from "express";
import { UserService } from "../services/user.service";

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
}