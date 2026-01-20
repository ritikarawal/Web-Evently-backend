import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";

export interface AuthenticatedRequest extends Request {
    userId?: string;
}

export const authMiddleware = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "No token provided",
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        (req as any).userId = decoded.userId;

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
};
