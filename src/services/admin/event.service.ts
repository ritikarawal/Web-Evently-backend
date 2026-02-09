import { EventModel, IEvent } from "../../domain/entities/event.model";
import mongoose from "mongoose";

export class EventService {
    async createEvent(data: Partial<IEvent>, organizerId: string): Promise<IEvent> {
        try {
            const event = new EventModel({
                ...data,
                organizer: organizerId,
                attendees: [organizerId], // Organizer is an attendee
            });
            await event.save();
            return event;
        } catch (error: any) {
            throw {
                statusCode: 400,
                message: error.message || "Failed to create event",
            };
        }
    }

    async getEventById(eventId: string): Promise<IEvent | null> {
        try {
            const event = await EventModel.findById(eventId)
                .populate("organizer", "username email firstName lastName")
                .populate("attendees", "username email firstName lastName");
            return event;
        } catch (error: any) {
            throw {
                statusCode: 400,
                message: "Invalid event ID",
            };
        }
    }

    async getAllEvents(filters?: any): Promise<IEvent[]> {
        try {
            const query: any = { isPublic: true };

            if (filters?.category) query.category = filters.category;
            if (filters?.search) {
                query.$or = [
                    { title: { $regex: filters.search, $options: "i" } },
                    { description: { $regex: filters.search, $options: "i" } },
                ];
            }
            if (filters?.startDate) {
                query.startDate = { $gte: new Date(filters.startDate) };
            }

            const events = await EventModel.find(query)
                .populate("organizer", "username email firstName lastName")
                .sort({ startDate: 1 })
                .limit(50);

            return events;
        } catch (error: any) {
            throw {
                statusCode: 400,
                message: "Failed to fetch events",
            };
        }
    }

    async getUserEvents(userId: string): Promise<IEvent[]> {
        try {
            const events = await EventModel.find({ organizer: userId })
                .populate("organizer", "username email firstName lastName")
                .populate("attendees", "username email firstName lastName")
                .sort({ startDate: 1 });

            return events;
        } catch (error: any) {
            throw {
                statusCode: 400,
                message: "Failed to fetch user events",
            };
        }
    }

    async updateEvent(
        eventId: string,
        data: Partial<IEvent>,
        userId: string
    ): Promise<IEvent | null> {
        try {
            const event = await EventModel.findById(eventId);

            if (!event) {
                throw { statusCode: 404, message: "Event not found" };
            }

            if (event.organizer.toString() !== userId) {
                throw {
                    statusCode: 403,
                    message: "Only organizer can update this event",
                };
            }

            const updatedEvent = await EventModel.findByIdAndUpdate(
                eventId,
                { $set: data },
                { new: true }
            )
                .populate("organizer", "username email firstName lastName")
                .populate("attendees", "username email firstName lastName");

            return updatedEvent;
        } catch (error: any) {
            throw {
                statusCode: error.statusCode || 400,
                message: error.message || "Failed to update event",
            };
        }
    }

    async deleteEvent(eventId: string, userId: string): Promise<void> {
        try {
            const event = await EventModel.findById(eventId);

            if (!event) {
                throw { statusCode: 404, message: "Event not found" };
            }

            if (event.organizer.toString() !== userId) {
                throw {
                    statusCode: 403,
                    message: "Only organizer can delete this event",
                };
            }

            await EventModel.findByIdAndDelete(eventId);
        } catch (error: any) {
            throw {
                statusCode: error.statusCode || 400,
                message: error.message || "Failed to delete event",
            };
        }
    }

    async joinEvent(eventId: string, userId: string): Promise<IEvent | null> {
        try {
            const event = await EventModel.findById(eventId);

            if (!event) {
                throw { statusCode: 404, message: "Event not found" };
            }

            if (event.attendees.includes(new mongoose.Types.ObjectId(userId))) {
                throw {
                    statusCode: 400,
                    message: "User already attending this event",
                };
            }

            if (event.capacity && event.attendees.length >= event.capacity) {
                throw {
                    statusCode: 400,
                    message: "Event is at full capacity",
                };
            }

            event.attendees.push(new mongoose.Types.ObjectId(userId));
            await event.save();

            return event.populate([
                { path: "organizer", select: "username email firstName lastName" },
                { path: "attendees", select: "username email firstName lastName" },
            ]);
        } catch (error: any) {
            throw {
                statusCode: error.statusCode || 400,
                message: error.message || "Failed to join event",
            };
        }
    }

    async leaveEvent(eventId: string, userId: string): Promise<IEvent | null> {
        try {
            const event = await EventModel.findById(eventId);

            if (!event) {
                throw { statusCode: 404, message: "Event not found" };
            }

            event.attendees = event.attendees.filter(
                (id) => id.toString() !== userId
            );

            await event.save();

            return event.populate([
                { path: "organizer", select: "username email firstName lastName" },
                { path: "attendees", select: "username email firstName lastName" },
            ]);
        } catch (error: any) {
            throw {
                statusCode: error.statusCode || 400,
                message: error.message || "Failed to leave event",
            };
        }
    }

    async getEventsByStatus(status: 'pending' | 'approved' | 'declined'): Promise<IEvent[]> {
        try {
            const events = await EventModel.find({ status })
                .populate("organizer", "username email firstName lastName")
                .populate("attendees", "username email firstName lastName")
                .sort({ createdAt: -1 });

            return events;
        } catch (error: any) {
            throw {
                statusCode: 400,
                message: "Failed to fetch events by status",
            };
        }
    }

    async updateEventStatus(
        eventId: string,
        status: 'pending' | 'approved' | 'declined',
        adminNotes?: string
    ): Promise<IEvent | null> {
        try {
            const updateData: any = { status };
            if (adminNotes !== undefined) {
                updateData.adminNotes = adminNotes;
            }

            const event = await EventModel.findByIdAndUpdate(
                eventId,
                { $set: updateData },
                { new: true }
            )
                .populate("organizer", "username email firstName lastName")
                .populate("attendees", "username email firstName lastName");

            if (!event) {
                throw { statusCode: 404, message: "Event not found" };
            }

            return event;
        } catch (error: any) {
            throw {
                statusCode: error.statusCode || 400,
                message: error.message || "Failed to update event status",
            };
        }
    }
}
