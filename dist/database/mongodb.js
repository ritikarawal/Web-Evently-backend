"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDatabase = connectDatabase;
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = require("../config");
async function connectDatabase() {
    try {
        console.log(` Connecting to MongoDB at: ${config_1.MONGODB_URI}`);
        await mongoose_1.default.connect(config_1.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 5000,
        });
        console.log("Connected to MongoDB successfully");
    }
    catch (error) {
        console.error("MongoDB connection failed:", error);
        console.error("Make sure MongoDB is running on:", config_1.MONGODB_URI);
        console.warn(" Server continuing without database connection");
    }
}
//# sourceMappingURL=mongodb.js.map