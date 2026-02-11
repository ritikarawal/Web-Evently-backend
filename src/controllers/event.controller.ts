import { Request, Response } from "express";
import { EventService } from "../services/admin/event.service";

const eventService = new EventService();

export class EventController {
    async createEvent(req: Request, res: Response) {
        try {
            const userId = (req as any).userId;
            const event = await eventService.createEvent(req.body, userId);

            return res.status(201).json({
                success: true,
                message: "Event created successfully",
                data: event,
            });
        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Failed to create event",
            });
        }
    }

    async getEvent(req: Request, res: Response) {
        try {
            const { eventId } = req.params;
            const event = await eventService.getEventById(eventId);

            if (!event) {
                return res.status(404).json({
                    success: false,
                    message: "Event not found",
                });
            }

            return res.status(200).json({
                success: true,
                message: "Event fetched successfully",
                data: event,
            });
        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Failed to fetch event",
            });
        }
    }

    async getAllEvents(req: Request, res: Response) {
        try {
            const filters = {
                category: req.query.category,
                search: req.query.search,
                startDate: req.query.startDate,
            };

            const events = await eventService.getAllEvents(filters);

            return res.status(200).json({
                success: true,
                message: "Events fetched successfully",
                data: events,
            });
        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Failed to fetch events",
            });
        }
    }

    async getUserEvents(req: Request, res: Response) {
        try {
            const userId = (req as any).userId;
            const events = await eventService.getUserEvents(userId);

            return res.status(200).json({
                success: true,
                message: "User events fetched successfully",
                data: events,
            });
        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Failed to fetch user events",
            });
        }
    }

    async updateEvent(req: Request, res: Response) {
        try {
            const userId = (req as any).userId;
            const { eventId } = req.params;

            const event = await eventService.updateEvent(eventId, req.body, userId);

            return res.status(200).json({
                success: true,
                message: "Event updated successfully",
                data: event,
            });
        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Failed to update event",
            });
        }
    }

    async deleteEvent(req: Request, res: Response) {
        try {
            const userId = (req as any).userId;
            const { eventId } = req.params;

            await eventService.deleteEvent(eventId, userId);

            return res.status(200).json({
                success: true,
                message: "Event deleted successfully",
            });
        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Failed to delete event",
            });
        }
    }

    async joinEvent(req: Request, res: Response) {
        try {
            const userId = (req as any).userId;
            const { eventId } = req.params;

            const event = await eventService.joinEvent(eventId, userId);

            return res.status(200).json({
                success: true,
                message: "Successfully joined event",
                data: event,
            });
        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Failed to join event",
            });
        }
    }

    async leaveEvent(req: Request, res: Response) {
        try {
            const userId = (req as any).userId;
            const { eventId } = req.params;

            const event = await eventService.leaveEvent(eventId, userId);

            return res.status(200).json({
                success: true,
                message: "Successfully left event",
                data: event,
            });
        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Failed to leave event",
            });
        }
    }

    async respondToBudgetProposal(req: Request, res: Response) {
        try {
            const userId = (req as any).userId;
            const { eventId } = req.params;
            const { accepted, counterProposal, message } = req.body;

            const event = await eventService.respondToBudgetProposal(eventId, userId, accepted, counterProposal, message);

            return res.status(200).json({
                success: true,
                message: accepted ? "Budget accepted successfully" : "Budget response sent successfully",
                data: event,
            });
        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Failed to respond to budget proposal",
            });
        }
    }

    async getBudgetNegotiationHistory(req: Request, res: Response) {
        try {
            const { eventId } = req.params;
            const history = await eventService.getBudgetNegotiationHistory(eventId);

            return res.status(200).json({
                success: true,
                message: "Budget negotiation history fetched successfully",
                data: history,
            });
        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Failed to fetch budget negotiation history",
            });
        }
    }
}
