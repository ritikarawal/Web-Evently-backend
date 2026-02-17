import { TicketModel } from "../domain/entities/ticket.model";
import QRCode from "qrcode";
import mongoose from "mongoose";

export class TicketService {
    async createTicket(eventId: string, userId: string): Promise<any> {
        try {
            // Generate QR code data (can be eventId + userId + timestamp)
            const qrData = `${eventId}:${userId}:${Date.now()}`;
            const qrCode = await QRCode.toDataURL(qrData);

            // Create ticket
            const ticket = new TicketModel({
                event: new mongoose.Types.ObjectId(eventId),
                user: new mongoose.Types.ObjectId(userId),
                qrCode,
                status: "issued"
            });
            await ticket.save();
            return ticket;
        } catch (error) {
            throw error;
        }
    }

    async getTicket(eventId: string, userId: string): Promise<any> {
        return TicketModel.findOne({ event: eventId, user: userId });
    }

    async validateTicket(qrData: string): Promise<any> {
        // Find ticket by QR code
        const ticket = await TicketModel.findOne({ qrCode: qrData });
        if (!ticket) throw new Error("Invalid ticket");
        if (ticket.status === "checked_in") throw new Error("Ticket already checked in");
        // Mark as checked in
        ticket.status = "checked_in";
        await ticket.save();
        return ticket;
    }
}
