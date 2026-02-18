import { Request, Response } from "express";
import { VenueService } from "../services/admin/venue.service";

const venueService = new VenueService();

export class VenueController {
    async createVenue(req: Request, res: Response) {
        try {
            const userId = (req as any).userId;
            const venue = await venueService.createVenue(req.body, userId);

            return res.status(201).json({
                success: true,
                message: "Venue created successfully",
                data: venue,
            });
        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Failed to create venue",
            });
        }
    }

    async getVenue(req: Request, res: Response) {
        try {
            const { venueId } = req.params;
            const venue = await venueService.getVenueById(venueId);

            if (!venue) {
                return res.status(404).json({
                    success: false,
                    message: "Venue not found",
                });
            }

            return res.status(200).json({
                success: true,
                message: "Venue fetched successfully",
                data: venue,
            });
        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Failed to fetch venue",
            });
        }
    }

    async getAllVenues(req: Request, res: Response) {
        try {
            const filters = {
                city: req.query.city,
                state: req.query.state,
                capacity: req.query.capacity,
                priceRange: req.query.priceRange,
                amenities: req.query.amenities,
                search: req.query.search,
            };

            const venues = await venueService.getAllVenues(filters);

            return res.status(200).json({
                success: true,
                message: "Venues fetched successfully",
                data: venues,
            });
        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Failed to fetch venues",
            });
        }
    }

    async getUserVenues(req: Request, res: Response) {
        try {
            const userId = (req as any).userId;
            const venues = await venueService.getVenuesByCreator(userId);

            return res.status(200).json({
                success: true,
                message: "User venues fetched successfully",
                data: venues,
            });
        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Failed to fetch user venues",
            });
        }
    }

    async updateVenue(req: Request, res: Response) {
        try {
            const userId = (req as any).userId;
            const { venueId } = req.params;

            const venue = await venueService.updateVenue(venueId, req.body, userId);

            return res.status(200).json({
                success: true,
                message: "Venue updated successfully",
                data: venue,
            });
        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Failed to update venue",
            });
        }
    }

    async deleteVenue(req: Request, res: Response) {
        try {
            const userId = (req as any).userId;
            const { venueId } = req.params;

            await venueService.deleteVenue(venueId, userId);

            return res.status(200).json({
                success: true,
                message: "Venue deleted successfully",
            });
        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Failed to delete venue",
            });
        }
    }

    async toggleVenueStatus(req: Request, res: Response) {
        try {
            const userId = (req as any).userId;
            const { venueId } = req.params;

            const venue = await venueService.toggleVenueStatus(venueId, userId);

            return res.status(200).json({
                success: true,
                message: `Venue ${venue?.isActive ? 'activated' : 'deactivated'} successfully`,
                data: venue,
            });
        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Failed to toggle venue status",
            });
        }
    }

    async getAllVenuesForAdmin(req: Request, res: Response) {
        try {
            const filters = {
                status: req.query.status,
                city: req.query.city,
                creator: req.query.creator,
            };

            const venues = await venueService.getAllVenuesForAdmin(filters);

            return res.status(200).json({
                success: true,
                message: "Venues fetched successfully",
                data: venues,
            });
        } catch (error: any) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Failed to fetch venues for admin",
            });
        }
    }
}