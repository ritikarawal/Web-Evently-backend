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
        console.log('\ud83d\udd11 Auth Middleware - Headers:', req.headers.authorization);
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            console.log('\u274c Auth Middleware - No token found');
            return res.status(401).json({
                success: false,
                message: "No token provided",
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
        (req as any).userId = decoded.id;
        console.log('\u2705 Auth Middleware - User authenticated:', decoded.id);

        next();
    } catch (error) {
        console.log('\u274c Auth Middleware - Token verification failed:', error);
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
};
