import mongoose from "mongoose";
import { MONGODB_URI } from "../config";

export async function connectDatabase(){
    try {
        console.log(`🔄 Connecting to MongoDB at: ${MONGODB_URI}`);
        
        await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 5000, // 5 second timeout
            socketTimeoutMS: 5000,
        });
        
        console.log("✅ Connected to MongoDB successfully");
    } catch (error) {
        console.error("❌ MongoDB connection failed:", error);
        console.error("Make sure MongoDB is running on:", MONGODB_URI);
        // Don't exit - let server run so we can debug
        console.warn("⚠️  Server continuing without database connection");
    }
}    