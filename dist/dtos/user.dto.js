"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetUsersDTO = exports.UpdateUserDTO = exports.LoginUserDTO = exports.CreateUserDTO = void 0;
const zod_1 = __importDefault(require("zod"));
const user_type_1 = require("../types/user.type");
exports.CreateUserDTO = user_type_1.UserSchema.pick({
    email: true,
    username: true,
    password: true,
    firstName: true,
    lastName: true,
    phoneNumber: true,
    role: true,
    profilePicture: true,
}).extend({
    confirmPassword: zod_1.default.string().min(6),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});
exports.LoginUserDTO = zod_1.default.object({
    email: zod_1.default.string().email(),
    password: zod_1.default.string().min(6),
});
exports.UpdateUserDTO = user_type_1.UserSchema.partial(); // all attributes optional
exports.GetUsersDTO = zod_1.default.object({
    page: zod_1.default.coerce.number().int().min(1).default(1),
    limit: zod_1.default.coerce.number().int().min(1).max(100).default(10),
});
//# sourceMappingURL=user.dto.js.map