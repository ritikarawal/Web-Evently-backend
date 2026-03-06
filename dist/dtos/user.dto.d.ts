import z from "zod";
export declare const CreateUserDTO: z.ZodObject<{
    email: z.ZodString;
    username: z.ZodString;
    password: z.ZodString;
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    phoneNumber: z.ZodOptional<z.ZodString>;
    role: z.ZodDefault<z.ZodEnum<{
        user: "user";
        admin: "admin";
    }>>;
    profilePicture: z.ZodOptional<z.ZodString>;
    confirmPassword: z.ZodString;
}, z.core.$strip>;
export type CreateUserDTO = z.infer<typeof CreateUserDTO>;
export declare const LoginUserDTO: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export type LoginUserDTO = z.infer<typeof LoginUserDTO>;
export declare const UpdateUserDTO: z.ZodObject<{
    email: z.ZodOptional<z.ZodString>;
    username: z.ZodOptional<z.ZodString>;
    password: z.ZodOptional<z.ZodString>;
    firstName: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    lastName: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    phoneNumber: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    role: z.ZodOptional<z.ZodDefault<z.ZodEnum<{
        user: "user";
        admin: "admin";
    }>>>;
    profilePicture: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
export type UpdateUserDTO = z.infer<typeof UpdateUserDTO>;
export declare const GetUsersDTO: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export type GetUsersDTO = z.infer<typeof GetUsersDTO>;
//# sourceMappingURL=user.dto.d.ts.map