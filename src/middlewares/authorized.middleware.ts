import { Request, Response, NextFunction } from 'express';
import { JWT_SECRET } from '../config';
import jwt from 'jsonwebtoken';
import { IUser } from '../domain/entities/user.model';
 import { UserRepository } from '../infrastructure/repositories/user.repository';
import { HttpError } from '../errors/http-error';

declare global {
    namespace Express {
        interface Request {
            user?: Record<string, any> | IUser
        }
    }
} // adding tag (user) to request, can use req.user
let userRepository = new UserRepository();
export const authorizedMiddleware =
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authHeader = req.headers.authorization;
            console.log('[authorizedMiddleware] authHeader:', authHeader);
            if (!authHeader || !authHeader.startsWith('Bearer '))
                throw new HttpError(401, 'Unauthorized JWT invalid');
            // JWT token should start with "Bearer <token>"
            const token = authHeader.split(' ')[1]; // 0 -> Bearer, 1 -> token
            console.log('[authorizedMiddleware] token:', token ? 'present' : 'missing');
            if (!token) throw new HttpError(401, 'Unauthorized JWT missing');
            const decodedToken = jwt.verify(token, JWT_SECRET) as Record<string, any>;
            console.log('[authorizedMiddleware] decodedToken.id:', decodedToken.id);
            if (!decodedToken || !decodedToken.id) {
                throw new HttpError(401, 'Unauthorized JWT unverified');
            } // make function async
            const user = await userRepository.getUserById(decodedToken.id);
            console.log('[authorizedMiddleware] user found:', !!user);
            if (!user) throw new HttpError(401, 'Unauthorized user not found');
            req.user = user; // attach user to request (like tag)
            next();
        } catch (err: Error | any) {
            console.error('[authorizedMiddleware] error:', err.message);
            const isJwtError = err?.name === "JsonWebTokenError" || err?.name === "TokenExpiredError";
            const statusCode = err.statusCode || (isJwtError ? 401 : 500);
            return res.status(statusCode).json(
                { success: false, message: err.message }
            )
        }
    }

export const adminMiddleware = async (
    req: Request, res: Response, next: NextFunction
) => {
    try {
        console.log('[adminMiddleware] req.user:', req.user ? `${req.user.firstName} (${req.user.role})` : 'missing');
        if (!req.user) {
            throw new HttpError(401, 'Unauthorized no user info');
        }
        if (req.user.role !== 'admin') {
            throw new HttpError(403, 'Forbidden not admin');
        }
        return next();
    } catch (err: Error | any) {
        return res.status(err.statusCode || 500).json(
            { success: false, message: err.message }
        )
    }
}