import mongoose, { Document } from "mongoose";
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
    eventType?: 'paid' | 'free';
    organizer: mongoose.Types.ObjectId;
    attendees: mongoose.Types.ObjectId[];
    isPublic: boolean;
    status: 'draft' | 'published' | 'cancelled' | 'pending' | 'approved' | 'declined';
    adminNotes?: string;
    proposedBudget?: number;
    adminProposedBudget?: number;
    finalBudget?: number;
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
export declare const EventModel: mongoose.Model<IEvent, {}, {}, {}, mongoose.Document<unknown, {}, IEvent, {}, mongoose.DefaultSchemaOptions> & IEvent & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IEvent>;
//# sourceMappingURL=event.model.d.ts.map