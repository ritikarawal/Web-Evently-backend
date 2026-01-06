import mongoose, { Schema, Document } from "mongoose";
import { UserType } from "../types/user.type";

const UserSchema: Schema = new Schema(
    {
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        username: { type: String, required: true, unique: true },
        firstName: { type: String },
        lastName: { type: String },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },
    },
    {
        timestamps: true,
    }
);

export interface IUser extends UserType, Document {}

export const UserModel = mongoose.model<IUser>("User", UserSchema);
