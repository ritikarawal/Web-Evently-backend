import z from "zod";
import { UserSchema } from "../types/user.type";

export const CreateUserDTO = UserSchema.pick({
    email: true,
    username: true,
    password: true,
    firstName: true,
    lastName: true,
    phoneNumber: true,
    role: true,
    profilePicture: true,
}).extend({
    confirmPassword: z.string().min(6),
}).refine(
    (data) => data.password === data.confirmPassword,
    {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    }
);

export type CreateUserDTO = z.infer<typeof CreateUserDTO>;

export const LoginUserDTO = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

export type LoginUserDTO = z.infer<typeof LoginUserDTO>;

export const UpdateUserDTO = UserSchema.partial(); // all attributes optional
export type UpdateUserDTO = z.infer<typeof UpdateUserDTO>;

export const GetUsersDTO = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
});

export type GetUsersDTO = z.infer<typeof GetUsersDTO>;
