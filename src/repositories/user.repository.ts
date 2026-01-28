import { UserModel, IUser } from "../models/user.model";

export class UserRepository {
    async createUser(data: Partial<IUser>) {
        return await new UserModel(data).save();
    }

    async getUserByEmail(email: string) {
        return await UserModel.findOne({ email });
    }

    async getUserByUsername(username: string) {
        return await UserModel.findOne({ username });
    }

    async updateUser(userId: string, data: Partial<IUser>) {
        return await UserModel.findByIdAndUpdate(
            userId,
            { $set: data },
            { new: true }
        ).select("-password");
    }
}
