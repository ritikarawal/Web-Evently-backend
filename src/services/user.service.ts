import { CreateUserDTO, LoginUserDTO } from "../dtos/user.dto";
import { UserRepository } from "../repositories/user.repository";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import { HttpError } from "../errors/http-error";
import { IUser } from "../models/user.model";

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

        return { token, user };
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

        return { token, user };
    }
}
