"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventService = void 0;
const event_model_1 = require("../../domain/entities/event.model");
const mongoose_1 = __importDefault(require("mongoose"));
const notification_service_1 = require("./notification.service");
const user_service_1 = require("./user.service");
class EventService {
    constructor() {
        this.notificationService = new notification_service_1.NotificationService();
        this.adminUserService = new user_service_1.AdminUserService();
    }
    async createEvent(data, organizerId) {
        try {
            const event = new event_model_1.EventModel({
                ...data,
                eventType: data.eventType || 'free',
                organizer: organizerId,
                attendees: [organizerId], // Organizer is an attendee
                status: 'pending', // Events start as pending for admin approval
                budgetStatus: 'pending', // Budget starts as pending
                budgetNegotiationHistory: data.proposedBudget ? [{
                        proposer: 'user',
                        proposerId: new mongoose_1.default.Types.ObjectId(organizerId),
                        amount: data.proposedBudget,
                        message: `User proposed budget: $${data.proposedBudget}`,
                        timestamp: new Date()
                    }] : []
            });
            await event.save();
            // Notify admins about new event requiring approval
            const adminUsers = await this.adminUserService.getAdminUsers();
            for (const admin of adminUsers) {
                await this.notificationService.createNotification(admin._id.toString(), "New Event Requires Approval", `A new event "${event.title}" has been created and requires your approval.`, "event_updated", event._id.toString());
            }
            return event;
        }
        catch (error) {
            throw {
                statusCode: 400,
                message: error.message || "Failed to create event",
            };
        }
    }
    async getEventById(eventId) {
        try {
            const event = await event_model_1.EventModel.findById(eventId)
                .populate("organizer", "username email firstName lastName")
                .populate("attendees", "username email firstName lastName");
            return event;
        }
        catch (error) {
            throw {
                statusCode: 400,
                message: "Invalid event ID",
            };
        }
    }
    async getAllEvents(filters) {
        try {
            const query = {};
            // Only add isPublic/status if not present in filters
            if (filters?.isPublic !== undefined)
                query.isPublic = filters.isPublic;
            else
                query.isPublic = true;
            if (filters?.status)
                query.status = Array.isArray(filters.status) ? { $in: filters.status } : filters.status;
            else
                query.status = { $in: ['approved', 'published'] };
            if (filters?.category)
                query.category = filters.category;
            if (filters?.search) {
                query.$or = [
                    { title: { $regex: filters.search, $options: "i" } },
                    { description: { $regex: filters.search, $options: "i" } },
                ];
            }
            if (filters?.startDate) {
                query.startDate = { $gte: new Date(filters.startDate) };
            }
            const events = await event_model_1.EventModel.find(query)
                .populate("organizer", "username email firstName lastName")
                .sort({ startDate: 1 })
                .limit(50);
            return events;
        }
        catch (error) {
            throw {
                statusCode: 400,
                message: "Failed to fetch events",
            };
        }
    }
    async getUserEvents(userId) {
        try {
            // Get events where user is organizer OR attendee
            const events = await event_model_1.EventModel.find({
                $or: [
                    { organizer: userId },
                    { attendees: userId }
                ]
            })
                .populate("organizer", "username email firstName lastName")
                .populate("attendees", "username email firstName lastName")
                .sort({ startDate: 1 });
            return events;
        }
        catch (error) {
            throw {
                statusCode: 400,
                message: "Failed to fetch user events",
            };
        }
    }
    async updateEvent(eventId, data, userId) {
        try {
            const event = await event_model_1.EventModel.findById(eventId);
            if (!event) {
                throw { statusCode: 404, message: "Event not found" };
            }
            if (event.organizer.toString() !== userId) {
                throw {
                    statusCode: 403,
                    message: "Only organizer can update this event",
                };
            }
            // Set status to pending for admin approval when organizer updates
            const updateData = { ...data, eventType: data.eventType || event.eventType || 'free', status: 'pending' };
            const updatedEvent = await event_model_1.EventModel.findByIdAndUpdate(eventId, { $set: updateData }, { new: true })
                .populate("organizer", "username email firstName lastName")
                .populate("attendees", "username email firstName lastName");
            // Notify all admins about the event update
            if (updatedEvent) {
                try {
                    const admins = await this.adminUserService.getAdminUsers();
                    for (const admin of admins) {
                        await this.notificationService.createNotification(admin._id.toString(), "Event Update Pending Approval", `Event "${updatedEvent.title}" has been updated by ${updatedEvent.organizer.firstName} ${updatedEvent.organizer.lastName} and is pending your approval.`, 'event_updated', eventId);
                    }
                }
                catch (notificationError) {
                    console.error("Failed to create admin notifications:", notificationError);
                    // Don't fail the update if notifications fail
                }
            }
            return updatedEvent;
        }
        catch (error) {
            throw {
                statusCode: error.statusCode || 400,
                message: error.message || "Failed to update event",
            };
        }
    }
    async deleteEvent(eventId, userId) {
        try {
            const event = await event_model_1.EventModel.findById(eventId);
            if (!event) {
                throw { statusCode: 404, message: "Event not found" };
            }
            // Allow admin to delete any event, or organizer to delete their own event
            if (userId !== "admin" && event.organizer.toString() !== userId) {
                throw {
                    statusCode: 403,
                    message: "Only organizer or admin can delete this event",
                };
            }
            await event_model_1.EventModel.findByIdAndDelete(eventId);
        }
        catch (error) {
            throw {
                statusCode: error.statusCode || 400,
                message: error.message || "Failed to delete event",
            };
        }
    }
    async joinEvent(eventId, userId) {
        try {
            const event = await event_model_1.EventModel.findById(eventId);
            if (!event) {
                throw { statusCode: 404, message: "Event not found" };
            }
            if (event.attendees.includes(new mongoose_1.default.Types.ObjectId(userId))) {
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
            event.attendees.push(new mongoose_1.default.Types.ObjectId(userId));
            await event.save();
            return event.populate([
                { path: "organizer", select: "username email firstName lastName" },
                { path: "attendees", select: "username email firstName lastName" },
            ]);
        }
        catch (error) {
            throw {
                statusCode: error.statusCode || 400,
                message: error.message || "Failed to join event",
            };
        }
    }
    async leaveEvent(eventId, userId) {
        try {
            const event = await event_model_1.EventModel.findById(eventId);
            if (!event) {
                throw { statusCode: 404, message: "Event not found" };
            }
            event.attendees = event.attendees.filter((id) => id.toString() !== userId);
            await event.save();
            return event.populate([
                { path: "organizer", select: "username email firstName lastName" },
                { path: "attendees", select: "username email firstName lastName" },
            ]);
        }
        catch (error) {
            throw {
                statusCode: error.statusCode || 400,
                message: error.message || "Failed to leave event",
            };
        }
    }
    async getEventsByStatus(status) {
        try {
            const events = await event_model_1.EventModel.find({ status })
                .populate("organizer", "username email firstName lastName")
                .populate("attendees", "username email firstName lastName")
                .sort({ createdAt: -1 });
            return events;
        }
        catch (error) {
            throw {
                statusCode: 400,
                message: "Failed to fetch events by status",
            };
        }
    }
    async updateEventStatus(eventId, status, adminNotes) {
        try {
            const updateData = { status };
            if (adminNotes !== undefined) {
                updateData.adminNotes = adminNotes;
            }
            // If approving, ensure isPublic is true (for public events)
            if (status === 'approved') {
                updateData.isPublic = true;
            }
            const event = await event_model_1.EventModel.findByIdAndUpdate(eventId, { $set: updateData }, { new: true })
                .populate("organizer", "username email firstName lastName")
                .populate("attendees", "username email firstName lastName");
            if (!event) {
                throw { statusCode: 404, message: "Event not found" };
            }
            return event;
        }
        catch (error) {
            throw {
                statusCode: error.statusCode || 400,
                message: error.message || "Failed to update event status",
            };
        }
    }
    async getAllEventsForAdminPaginated(options) {
        try {
            const { page, limit, status, category, search } = options;
            const query = {}; // No isPublic filter for admin
            if (status)
                query.status = status;
            if (category)
                query.category = category;
            if (search) {
                query.$or = [
                    { title: { $regex: search, $options: "i" } },
                    { description: { $regex: search, $options: "i" } },
                ];
            }
            const skip = (page - 1) * limit;
            const events = await event_model_1.EventModel.find(query)
                .populate("organizer", "username email firstName lastName")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);
            const total = await event_model_1.EventModel.countDocuments(query);
            const totalPages = Math.ceil(total / limit);
            return {
                events,
                currentPage: page,
                totalPages,
                total,
                limit
            };
        }
        catch (error) {
            throw {
                statusCode: 400,
                message: "Failed to fetch events for admin",
            };
        }
    }
    // Budget negotiation methods
    async proposeBudget(eventId, adminId, proposedBudget, message) {
        try {
            const event = await event_model_1.EventModel.findById(eventId);
            if (!event) {
                throw {
                    statusCode: 404,
                    message: "Event not found",
                };
            }
            // Update budget negotiation
            event.adminProposedBudget = proposedBudget;
            event.budgetStatus = 'negotiating';
            // Add to negotiation history
            if (!event.budgetNegotiationHistory) {
                event.budgetNegotiationHistory = [];
            }
            event.budgetNegotiationHistory.push({
                proposer: 'admin',
                proposerId: new mongoose_1.default.Types.ObjectId(adminId),
                amount: proposedBudget,
                message: message || `Admin proposed budget: $${proposedBudget}`,
                timestamp: new Date()
            });
            await event.save();
            // Notify the organizer
            const notificationService = new notification_service_1.NotificationService();
            await notificationService.createNotification(event.organizer.toString(), "Budget Proposal", `Admin has proposed a budget of $${proposedBudget} for your event "${event.title}". Please review and respond.`, "event_updated", eventId);
            return event;
        }
        catch (error) {
            throw {
                statusCode: error.statusCode || 400,
                message: error.message || "Failed to propose budget",
            };
        }
    }
    async respondToBudgetProposal(eventId, userId, accepted, counterProposal, message) {
        try {
            const event = await event_model_1.EventModel.findById(eventId);
            if (!event) {
                throw {
                    statusCode: 404,
                    message: "Event not found",
                };
            }
            // Verify user is the organizer
            if (event.organizer.toString() !== userId) {
                throw {
                    statusCode: 403,
                    message: "Only the event organizer can respond to budget proposals",
                };
            }
            if (accepted) {
                // Accept admin's proposed budget
                event.finalBudget = event.adminProposedBudget;
                event.budgetStatus = 'accepted';
                event.status = 'approved'; // Now the event can proceed to payment
                // Add to negotiation history
                event.budgetNegotiationHistory.push({
                    proposer: 'user',
                    proposerId: new mongoose_1.default.Types.ObjectId(userId),
                    amount: event.finalBudget,
                    message: message || `User accepted admin's budget proposal: $${event.finalBudget}`,
                    timestamp: new Date()
                });
                // Notify admin of acceptance
                const lastAdminProposal = event.budgetNegotiationHistory.filter(h => h.proposer === 'admin').pop();
                if (lastAdminProposal?.proposerId) {
                    const notificationService = new notification_service_1.NotificationService();
                    await notificationService.createNotification(lastAdminProposal.proposerId.toString(), "Budget Accepted", `User has accepted the budget proposal of $${event.finalBudget} for event "${event.title}". Event is now ready for payment processing.`, "event_approved", eventId);
                }
            }
            else if (counterProposal) {
                // Counter proposal from user
                event.proposedBudget = counterProposal;
                event.budgetStatus = 'negotiating';
                // Add to negotiation history
                event.budgetNegotiationHistory.push({
                    proposer: 'user',
                    proposerId: new mongoose_1.default.Types.ObjectId(userId),
                    amount: counterProposal,
                    message: message || `User counter-proposed budget: $${counterProposal}`,
                    timestamp: new Date()
                });
                // Notify admin of counter proposal
                const lastAdminProposal = event.budgetNegotiationHistory.filter(h => h.proposer === 'admin').pop();
                if (lastAdminProposal?.proposerId) {
                    const notificationService = new notification_service_1.NotificationService();
                    await notificationService.createNotification(lastAdminProposal.proposerId.toString(), "Budget Counter-Proposal", `User has counter-proposed a budget of $${counterProposal} for event "${event.title}". ${message ? `Message: ${message}` : ''}`, "event_updated", eventId);
                }
            }
            else {
                // Reject budget proposal
                event.budgetStatus = 'rejected';
                event.status = 'declined';
                // Add to negotiation history
                event.budgetNegotiationHistory.push({
                    proposer: 'user',
                    proposerId: new mongoose_1.default.Types.ObjectId(userId),
                    amount: event.adminProposedBudget,
                    message: message || `User rejected admin's budget proposal: $${event.adminProposedBudget}`,
                    timestamp: new Date()
                });
                // Notify admin of rejection
                const lastAdminProposal = event.budgetNegotiationHistory.filter(h => h.proposer === 'admin').pop();
                if (lastAdminProposal?.proposerId) {
                    const notificationService = new notification_service_1.NotificationService();
                    await notificationService.createNotification(lastAdminProposal.proposerId.toString(), "Budget Proposal Rejected", `User has rejected the budget proposal of $${event.adminProposedBudget} for event "${event.title}". ${message ? `Message: ${message}` : ''}`, "event_updated", eventId);
                }
            }
            await event.save();
            return event;
        }
        catch (error) {
            throw {
                statusCode: error.statusCode || 400,
                message: error.message || "Failed to respond to budget proposal",
            };
        }
    }
    async getBudgetNegotiationHistory(eventId) {
        try {
            const event = await event_model_1.EventModel.findById(eventId);
            if (!event) {
                throw {
                    statusCode: 404,
                    message: "Event not found",
                };
            }
            return event.budgetNegotiationHistory || [];
        }
        catch (error) {
            throw {
                statusCode: error.statusCode || 400,
                message: error.message || "Failed to get budget negotiation history",
            };
        }
    }
    async acceptUserBudgetProposal(eventId, adminId) {
        try {
            const event = await event_model_1.EventModel.findById(eventId);
            if (!event) {
                throw {
                    statusCode: 404,
                    message: "Event not found",
                };
            }
            if (event.status !== 'pending') {
                throw {
                    statusCode: 400,
                    message: `Cannot accept budget proposal: Event is already ${event.status}. Budget proposals can only be accepted for events in pending status.`,
                };
            }
            // Set final budget to user's current proposal
            event.finalBudget = event.proposedBudget;
            event.budgetStatus = 'accepted';
            event.status = 'approved';
            // Add to negotiation history
            if (!event.budgetNegotiationHistory) {
                event.budgetNegotiationHistory = [];
            }
            event.budgetNegotiationHistory.push({
                proposer: 'admin',
                proposerId: new mongoose_1.default.Types.ObjectId(adminId),
                amount: event.finalBudget,
                message: `Admin accepted user's budget proposal: $${event.finalBudget}`,
                timestamp: new Date()
            });
            await event.save();
            // Notify the organizer
            const notificationService = new notification_service_1.NotificationService();
            await notificationService.createNotification(event.organizer.toString(), "Budget Proposal Accepted", `Your budget proposal of $${event.finalBudget} has been accepted! Your event "${event.title}" is now approved and ready for payment processing.`, "event_approved", eventId);
            return event;
        }
        catch (error) {
            throw {
                statusCode: error.statusCode || 400,
                message: error.message || "Failed to accept user's budget proposal",
            };
        }
    }
}
exports.EventService = EventService;
//# sourceMappingURL=event.service.js.map