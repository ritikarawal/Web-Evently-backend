import mongoose, { Schema, Document } from "mongoose";

export interface ITicket extends Document {
    event: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    qrCode: string; // base64 or url
    status: "issued" | "checked_in";
    createdAt: Date;
    updatedAt: Date;
}

const TicketSchema: Schema = new Schema(
    {
        event: { type: Schema.Types.ObjectId, ref: "Event", required: true },
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        qrCode: { type: String, required: true },
        status: { type: String, enum: ["issued", "checked_in"], default: "issued" },
    },
    { timestamps: true }
);

TicketSchema.index({ event: 1, user: 1 }, { unique: true });

export const TicketModel = mongoose.model<ITicket>("Ticket", TicketSchema);
