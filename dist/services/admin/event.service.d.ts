import { IEvent } from "../../domain/entities/event.model";
export declare class EventService {
    private notificationService;
    private adminUserService;
    createEvent(data: Partial<IEvent>, organizerId: string): Promise<IEvent>;
    getEventById(eventId: string): Promise<IEvent | null>;
    getAllEvents(filters?: any): Promise<IEvent[]>;
    getUserEvents(userId: string): Promise<IEvent[]>;
    updateEvent(eventId: string, data: Partial<IEvent>, userId: string): Promise<IEvent | null>;
    deleteEvent(eventId: string, userId: string): Promise<void>;
    joinEvent(eventId: string, userId: string): Promise<IEvent | null>;
    leaveEvent(eventId: string, userId: string): Promise<IEvent | null>;
    getEventsByStatus(status: 'pending' | 'approved' | 'declined'): Promise<IEvent[]>;
    updateEventStatus(eventId: string, status: 'pending' | 'approved' | 'declined', adminNotes?: string): Promise<IEvent | null>;
    getAllEventsForAdminPaginated(options: {
        page: number;
        limit: number;
        status?: string;
        category?: string;
        search?: string;
    }): Promise<{
        events: IEvent[];
        currentPage: number;
        totalPages: number;
        total: number;
        limit: number;
    }>;
    proposeBudget(eventId: string, adminId: string, proposedBudget: number, message?: string): Promise<IEvent>;
    respondToBudgetProposal(eventId: string, userId: string, accepted: boolean, counterProposal?: number, message?: string): Promise<IEvent>;
    getBudgetNegotiationHistory(eventId: string): Promise<any[]>;
    acceptUserBudgetProposal(eventId: string, adminId: string): Promise<IEvent>;
}
//# sourceMappingURL=event.service.d.ts.map