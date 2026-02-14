import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
    user: mongoose.Types.ObjectId;
    title: string;
    message: string;
    type: 'event_approved' | 'event_declined' | 'event_updated' | 'general';
    isRead: boolean;
    eventId?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const NotificationSchema: Schema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        title: { type: String, required: true },
        message: { type: String, required: true },
        type: {
            type: String,
            enum: ["event_approved", "event_declined", "event_updated", "general"],
            required: true
        },
        isRead: { type: Boolean, default: false },
        eventId: {
            type: Schema.Types.ObjectId,
            ref: "Event"
        },
    },
    { timestamps: true }
);

// Index for efficient queries
NotificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

export const NotificationModel = mongoose.model<INotification>("Notification", NotificationSchema);