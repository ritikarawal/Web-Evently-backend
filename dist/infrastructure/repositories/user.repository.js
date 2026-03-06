"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const user_model_1 = require("../../domain/entities/user.model");
// MongoDb Implementation of UserRepository
class UserRepository {
    async createUser(userData) {
        const user = new user_model_1.UserModel(userData);
        return await user.save();
    }
    async getUserByEmail(email) {
        const user = await user_model_1.UserModel.findOne({ "email": email });
        return user;
    }
    async getUserByUsername(username) {
        const user = await user_model_1.UserModel.findOne({ "username": username });
        return user;
    }
    async getUserById(id) {
        // UserModel.findOne({ "_id": id });
        const user = await user_model_1.UserModel.findById(id);
        return user;
    }
    async getAllUsers() {
        const users = await user_model_1.UserModel.find();
        return users;
    }
    async getUsersPaginated(page, limit) {
        const skip = (page - 1) * limit;
        const users = await user_model_1.UserModel.find().skip(skip).limit(limit);
        const total = await user_model_1.UserModel.countDocuments();
        const totalPages = Math.ceil(total / limit);
        return {
            users,
            total,
            totalPages,
            currentPage: page,
        };
    }
    async getAdminUsers() {
        const admins = await user_model_1.UserModel.find({ role: "admin" });
        return admins;
    }
    async updateUser(id, updateData) {
        // UserModel.updateOne({ _id: id }, { $set: updateData });
        const updatedUser = await user_model_1.UserModel.findByIdAndUpdate(id, updateData, { new: true } // return the updated document
        );
        return updatedUser;
    }
    async deleteUser(id) {
        // UserModel.deleteOne({ _id: id });
        const result = await user_model_1.UserModel.findByIdAndDelete(id);
        return result ? true : false;
    }
}
exports.UserRepository = UserRepository;
//# sourceMappingURL=user.repository.js.map