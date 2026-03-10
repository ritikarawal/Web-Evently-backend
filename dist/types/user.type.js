"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.UserSchema = zod_1.default.object({
    email: zod_1.default.string().email(),
    username: zod_1.default.string().min(3),
    password: zod_1.default.string().min(6),
    firstName: zod_1.default.string().optional(),
    lastName: zod_1.default.string().optional(),
    phoneNumber: zod_1.default.string().optional(),
    role: zod_1.default.enum(["user", "admin"]).default("user"),
    profilePicture: zod_1.default.string().optional(),
});
//# sourceMappingURL=user.type.js.map