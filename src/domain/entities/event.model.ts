import mongoose, { Schema, Document } from "mongoose";

export interface IEvent extends Document {
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
    location: string;
    category: string;
    eventImage?: string;
    capacity?: number;
    ticketPrice?: number;
    organizer: mongoose.Types.ObjectId;
    attendees: mongoose.Types.ObjectId[];
    isPublic: boolean;
    status: 'draft' | 'published' | 'cancelled' | 'pending' | 'approved' | 'declined';
    adminNotes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const EventSchema: Schema = new Schema(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        location: { type: String, required: true },
        category: {
            type: String,
            enum: ["birthday", "anniversary", "wedding", "engagement", "workshop", "conference", "graduation", "fundraisers", "music", "sports", "education", "business", "entertainment", "other"],
            default: "other"
        },
        eventImage: { type: String },
        capacity: { type: Number },
        ticketPrice: { type: Number, default: 0 },
        organizer: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        attendees: [
            {
                type: Schema.Types.ObjectId,
                ref: "User"
            }
        ],
        isPublic: { type: Boolean, default: true },
        status: {
            type: String,
            enum: ["draft", "published", "cancelled", "pending", "approved", "declined"],
            default: "draft"
        },
        adminNotes: { type: String },
    },
    { timestamps: true }
);

export const EventModel = mongoose.model<IEvent>("Event", EventSchema);
