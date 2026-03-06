import { Request, Response, NextFunction } from 'express';
import { IUser } from '../domain/entities/user.model';
declare global {
    namespace Express {
        interface Request {
            user?: Record<string, any> | IUser;
        }
    }
}
export declare const authorizedMiddleware: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const adminMiddleware: (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
//# sourceMappingURL=authorized.middleware.d.ts.map