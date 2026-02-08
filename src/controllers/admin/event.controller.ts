import { Request, Response } from "express";
import { EventService } from "../../services/event.service";

const eventService = new EventService();

export class AdminEventController {
    async getPendingEvents(req: Request, res: Response) {
        try {
            const events = await eventService.getEventsByStatus("pending");

            return res.status(200).json({
                success: true,
                message: "Pending events fetched successfully",
                data: events,
            });
        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Failed to fetch pending events",
            });
        }
    }

    async approveEvent(req: Request, res: Response) {
        try {
            const { eventId } = req.params;
            const { adminNotes } = req.body;

            const event = await eventService.updateEventStatus(eventId, "approved", adminNotes);

            return res.status(200).json({
                success: true,
                message: "Event approved successfully",
                data: event,
            });
        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Failed to approve event",
            });
        }
    }

    async declineEvent(req: Request, res: Response) {
        try {
            const { eventId } = req.params;
            const { adminNotes } = req.body;

            const event = await eventService.updateEventStatus(eventId, "declined", adminNotes);

            return res.status(200).json({
                success: true,
                message: "Event declined successfully",
                data: event,
            });
        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Failed to decline event",
            });
        }
    }

    async getAllEvents(req: Request, res: Response) {
        try {
            const events = await eventService.getAllEvents({});

            return res.status(200).json({
                success: true,
                message: "All events fetched successfully",
                data: events,
            });
        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Failed to fetch events",
            });
        }
    }
}