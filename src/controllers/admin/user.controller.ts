import { CreateUserDTO, LoginUserDTO, UpdateUserDTO } from "../../dtos/user.dto";
import { Request, Response, NextFunction } from "express";
import z from "zod";
import { AdminUserService } from "../../services/admin/user.service";
import { IUser } from "../../domain/entities/user.model";

let adminUserService = new AdminUserService();

const sanitizeUser = (user: any) => {
    if (!user) return user;
    const obj = typeof user.toObject === "function" ? user.toObject() : { ...user };
    delete obj.password;
    return obj;
};

export class AdminUserController {
    async createUser(req: Request, res: Response, next: NextFunction) {
        try {
            const parsedData = CreateUserDTO.safeParse(req.body); // validate request body
            if (!parsedData.success) { // validation failed
                return res.status(400).json(
                    { success: false, message: z.prettifyError(parsedData.error) }
                )
            }
            if(req.file){   
                parsedData.data.profilePicture = `/uploads/profile-pictures/${req.file.filename}`;
            }
            const userData: CreateUserDTO = parsedData.data;
            const newUser = await adminUserService.createUser(userData);
            return res.status(201).json(
                { success: true, message: "User Created", data: sanitizeUser(newUser) }
            );
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            );
        }
    }

    async getAllUsers(req: Request, res: Response, next: NextFunction) {
        try {
            console.log('[AdminUserController.getAllUsers] Starting fetch');
            const users = await adminUserService.getAllUsers();
            console.log('[AdminUserController.getAllUsers] Found', users.length, 'users');
            const sanitizedUsers = users.map((user: IUser) => sanitizeUser(user));
            return res.status(200).json(
                { success: true, data: sanitizedUsers, message: "All Users Retrieved" }
            );
        } catch (error: Error | any) {
            console.error('[AdminUserController.getAllUsers] Error:', error.message);
            return res.status(error.statusCode ?? 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            );
        }
    }

    async updateUser(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.params.id;
            const parsedData = UpdateUserDTO.safeParse(req.body); // validate request body
            if (!parsedData.success) { // validation failed
                return res.status(400).json(
                    { success: false, message: z.prettifyError(parsedData.error) }
                )
            }
            
            if(req.file){   
                parsedData.data.profilePicture = `/uploads/profile-pictures/${req.file.filename}`;
            }
            const updateData: UpdateUserDTO = parsedData.data;
            const updatedUser = await adminUserService.updateUser(userId, updateData);
            return res.status(200).json(
                { success: true, message: "User Updated", data: sanitizeUser(updatedUser) }
            );
        }
        catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            );
        }
    }

    async deleteUser(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.params.id;
            const deleted = await adminUserService.deleteUser(userId);
            if (!deleted) {
                return res.status(404).json(
                    { success: false, message: "User not found" }
                );
            }
            return res.status(200).json(
                { success: true, message: "User Deleted" }
            );
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            );
        }
    }

    async getUserById(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.params.id;
            const user = await adminUserService.getUserById(userId);
            return res.status(200).json(
                { success: true, data: sanitizeUser(user), message: "Single User Retrieved" }
            );
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            );
        }
    }

}