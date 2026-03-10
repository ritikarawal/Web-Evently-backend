import mongoose, { Schema, Document } from "mongoose";

export interface IChat extends Document {
    userId: mongoose.Types.ObjectId;
    adminId?: mongoose.Types.ObjectId;
    messages: Array<{
        _id?: mongoose.Types.ObjectId;
        from: "user" | "admin";
        text: string;
        timestamp: Date;
        isRead: boolean;
        username?: string;
        senderName?: string;
    }>;
    createdAt: Date;
    updatedAt: Date;
}

const ChatSchema: Schema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        adminId: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        messages: [
            {
                from: {
                    type: String,
                    enum: ["user", "admin"],
                    required: true
                },
                text: {
                    type: String,
                    required: true
                },
                timestamp: {
                    type: Date,
                    default: () => new Date()
                },
                isRead: {
                    type: Boolean,
                    default: false
                },
                username: String,
                senderName: String
            }
        ]
    },
    { timestamps: true }
);

// Index for efficient queries
ChatSchema.index({ userId: 1, updatedAt: -1 });
ChatSchema.index({ adminId: 1, updatedAt: -1 });

export const ChatModel = mongoose.model<IChat>("Chat", ChatSchema);
