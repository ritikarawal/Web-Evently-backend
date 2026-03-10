import z from "zod";
export declare const UserSchema: z.ZodObject<{
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
}, z.core.$strip>;
export type UserType = z.infer<typeof UserSchema>;
//# sourceMappingURL=user.type.d.ts.map