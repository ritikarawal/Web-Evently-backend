import { Request, Response } from "express";
import { EventService } from "../../services/admin/event.service";
import { NotificationService } from "../../services/admin/notification.service";

const eventService = new EventService();
const notificationService = new NotificationService();

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
            const adminNotes = req.body?.adminNotes || '';

            const event = await eventService.updateEventStatus(eventId, "approved", adminNotes);

            // Create notification for the event organizer
            if (event && event.organizer) {
                const organizerId = typeof event.organizer === 'object' && event.organizer._id 
                    ? event.organizer._id.toString() 
                    : event.organizer.toString();
                console.log('Creating notification for user:', organizerId);
                try {
                    await notificationService.createNotification(
                        organizerId,
                        "Event Approved",
                        `Your event "${event.title}" has been approved and is now live.`,
                        "event_approved",
                        eventId
                    );
                    console.log('Notification created successfully');
                } catch (notificationError) {
                    console.error('Failed to create notification:', notificationError);
                }
            } else {
                console.log('No organizer found for event:', eventId);
            }

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
            const adminNotes = req.body?.adminNotes || '';

            const event = await eventService.updateEventStatus(eventId, "declined", adminNotes);

            // Create notification for the event organizer
            if (event && event.organizer) {
                const organizerId = typeof event.organizer === 'object' && event.organizer._id 
                    ? event.organizer._id.toString() 
                    : event.organizer.toString();
                console.log('Creating decline notification for user:', organizerId);
                try {
                    const reasonMessage = adminNotes ? ` Reason: ${adminNotes}` : "";
                    await notificationService.createNotification(
                        organizerId,
                        "Event Declined",
                        `Your event "${event.title}" has been declined.${reasonMessage}`,
                        "event_declined",
                        eventId
                    );
                    console.log('Decline notification created successfully');
                } catch (notificationError) {
                    console.error('Failed to create decline notification:', notificationError);
                }
            } else {
                console.log('No organizer found for declined event:', eventId);
            }

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