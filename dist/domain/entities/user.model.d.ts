import mongoose, { Document } from "mongoose";
export interface IUser extends Document {
    email: string;
    password: string;
    username: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    profilePicture?: string;
    role: "user" | "admin";
    createdAt: Date;
    updatedAt: Date;
}
export declare const UserModel: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, mongoose.DefaultSchemaOptions> & IUser & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IUser>;
//# sourceMappingURL=user.model.d.ts.map