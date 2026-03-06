import { IVenue } from "../../domain/entities/venue.model";
export declare class VenueService {
    createVenue(data: Partial<IVenue>, createdBy: string): Promise<IVenue>;
    getVenueById(venueId: string): Promise<IVenue | null>;
    getAllVenues(filters?: any): Promise<IVenue[]>;
    /**
     * Update venue details, including pricing array.
     * To update pricing, pass { pricing: [...] } in data.
     */
    updateVenue(venueId: string, data: Partial<IVenue>, userId: string): Promise<IVenue | null>;
    deleteVenue(venueId: string, userId: string): Promise<void>;
    getVenuesByCreator(creatorId: string): Promise<IVenue[]>;
    toggleVenueStatus(venueId: string, userId: string): Promise<IVenue | null>;
    updateVenueRating(venueId: string, newRating: number): Promise<IVenue | null>;
    getAllVenuesForAdmin(filters?: any): Promise<IVenue[]>;
}
//# sourceMappingURL=venue.service.d.ts.map