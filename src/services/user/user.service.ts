import { CreateUserDTO, LoginUserDTO } from "../../dtos/user.dto";
import { UserRepository } from "../../infrastructure/repositories/user.repository";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../config";
import { HttpError } from "../../errors/http-error";
import { IUser } from "../../domain/entities/user.model";
import { sendEmail } from "../../config/email";
const CLIENT_URL = process.env.CLIENT_URL as string;

const userRepo = new UserRepository();

export class UserService {
    async register(data: CreateUserDTO) {
        const emailExists = await userRepo.getUserByEmail(data.email);
        if (emailExists) {
            throw new HttpError(400, "Email already exists");
        }

        const usernameExists = await userRepo.getUserByUsername(data.username);
        if (usernameExists) {
            throw new HttpError(400, "Username already exists");
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);

        const user = await userRepo.createUser({
            ...data,
            password: hashedPassword,
        });

        const token = jwt.sign(
            { id: user._id, role: user.role },
            JWT_SECRET,
            { expiresIn: "30d" }
        );

        const userObject = user.toObject();
        delete (userObject as any).password;

        return { token, user: userObject };
    }

    async login(data: LoginUserDTO) {
        const user = await userRepo.getUserByEmail(data.email);
        if (!user) {
            throw new HttpError(404, "User not found");
        }

        const validPassword = await bcrypt.compare(
            data.password,
            user.password as string
        );
        if (!validPassword) {
            throw new HttpError(401, "Invalid credentials");
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            JWT_SECRET,
            { expiresIn: "30d" }
        );

        const userObject = user.toObject();
        delete (userObject as any).password;

        return { token, user: userObject };
    }

    async updateProfilePicture(userId: string, profilePictureUrl: string) {
        const user = await userRepo.updateUser(userId, {
            profilePicture: profilePictureUrl,
        });

        if (!user) {
            throw new HttpError(404, "User not found");
        }

        return user;
    }

    async getProfile(userId: string) {
        const user = await userRepo.getUserById(userId);
        if (!user) {
            throw new HttpError(404, "User not found");
        }

        const userObject = user.toObject();
        delete (userObject as any).password;
        return userObject;
    }

    async updateProfile(userId: string, data: Partial<IUser>) {
        const existingUser = await userRepo.getUserById(userId);
        if (!existingUser) {
            throw new HttpError(404, "User not found");
        }

        if (data.email && data.email !== existingUser.email) {
            const emailExists = await userRepo.getUserByEmail(data.email);
            if (emailExists) {
                throw new HttpError(400, "Email already exists");
            }
        }

        if (data.username && data.username !== existingUser.username) {
            const usernameExists = await userRepo.getUserByUsername(data.username);
            if (usernameExists) {
                throw new HttpError(400, "Username already exists");
            }
        }

        const updateData: Partial<IUser> = Object.fromEntries(
            Object.entries(data).filter(([, value]) => value !== undefined)
        ) as Partial<IUser>;

        if (data.password) {
            updateData.password = await bcrypt.hash(data.password, 10);
        }

        const updatedUser = await userRepo.updateUser(userId, updateData);
        if (!updatedUser) {
            throw new HttpError(404, "User not found");
        }

        const userObject = updatedUser.toObject();
        delete (userObject as any).password;
        return userObject;
    }
    async sendResetPasswordEmail(email?: string) {
        console.log(`Password reset requested for email: ${email}`);
        if (!email) {
            throw new HttpError(400, "Email is required");
        }
        const user = await userRepo.getUserByEmail(email);
        if (!user) {
            console.log(`User not found for email: ${email}`);
            throw new HttpError(404, "User not found");
        }
        console.log(`User found: ${user.email}, generating reset token`);
        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' }); // 1 hour expiry
        const resetLink = `${CLIENT_URL}/reset-password?token=${token}`;
        const html = `<p>Click <a href="${resetLink}">here</a> to reset your password. This link will expire in 1 hour.</p>`;
        await sendEmail(user.email, "Password Reset", html);
        return user;

    }

    async resetPassword(token?: string, newPassword?: string) {
        try {
            if (!token || !newPassword) {
                throw new HttpError(400, "Token and new password are required");
            }
            const decoded: any = jwt.verify(token, JWT_SECRET);
            const userId = decoded.id;
            const user = await userRepo.getUserById(userId);
            if (!user) {
                throw new HttpError(404, "User not found");
            }
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await userRepo.updateUser(userId, { password: hashedPassword });
            return user;
        } catch (error) {
            throw new HttpError(400, "Invalid or expired token");
        }
    }
}