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
    // Budget negotiation fields
    proposedBudget?: number;        // User's initial budget suggestion
    adminProposedBudget?: number;   // Admin's counter-proposal
    finalBudget?: number;           // Agreed upon budget
    budgetStatus: 'pending' | 'negotiating' | 'accepted' | 'rejected';
    budgetNegotiationHistory?: Array<{
        proposer: 'user' | 'admin';
        proposerId?: mongoose.Types.ObjectId;
        amount: number;
        message?: string;
        timestamp: Date;
    }>;
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
        // Budget negotiation fields
        proposedBudget: { type: Number },
        adminProposedBudget: { type: Number },
        finalBudget: { type: Number },
        budgetStatus: {
            type: String,
            enum: ["pending", "negotiating", "accepted", "rejected"],
            default: "pending"
        },
        budgetNegotiationHistory: [{
            proposer: {
                type: String,
                enum: ["user", "admin"],
                required: true
            },
            proposerId: {
                type: Schema.Types.ObjectId,
                ref: "User"
            },
            amount: { type: Number, required: true },
            message: { type: String },
            timestamp: { type: Date, default: Date.now }
        }],
    },
    { timestamps: true }
);

export const EventModel = mongoose.model<IEvent>("Event", EventSchema);