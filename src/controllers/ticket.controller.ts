import { Request, Response } from "express";
import { TicketService } from "../services/ticket.service";

const ticketService = new TicketService();

export class TicketController {
    async createTicket(req: Request, res: Response) {
        try {
            const { eventId, userId } = req.body;
            const ticket = await ticketService.createTicket(eventId, userId);
            return res.status(201).json({ success: true, data: ticket });
        } catch (error: any) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }

    async getTicket(req: Request, res: Response) {
        try {
            const { eventId, userId } = req.params;
            const ticket = await ticketService.getTicket(eventId, userId);
            if (!ticket) return res.status(404).json({ success: false, message: "Ticket not found" });
            return res.status(200).json({ success: true, data: ticket });
        } catch (error: any) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }

    async checkIn(req: Request, res: Response) {
        try {
            const { qrData } = req.body;
            const ticket = await ticketService.validateTicket(qrData);
            return res.status(200).json({ success: true, data: ticket });
        } catch (error: any) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }
}
