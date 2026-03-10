"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VenueController = void 0;
const venue_service_1 = require("../services/admin/venue.service");
const venueService = new venue_service_1.VenueService();
class VenueController {
    async createVenue(req, res) {
        try {
            const userId = req.userId;
            const venue = await venueService.createVenue(req.body, userId);
            return res.status(201).json({
                success: true,
                message: "Venue created successfully",
                data: venue,
            });
        }
        catch (error) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Failed to create venue",
            });
        }
    }
    async getVenue(req, res) {
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
        }
        catch (error) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Failed to fetch venue",
            });
        }
    }
    async getAllVenues(req, res) {
        try {
            const filters = {
                city: req.query.city,
                state: req.query.state,
                capacity: req.query.capacity,
                priceRange: req.query.priceRange,
                amenities: req.query.amenities,
                search: req.query.search,
                recommendedCategory: req.query.recommendedCategory,
            };
            const venues = await venueService.getAllVenues(filters);
            return res.status(200).json({
                success: true,
                message: "Venues fetched successfully",
                data: venues,
            });
        }
        catch (error) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Failed to fetch venues",
            });
        }
    }
    async getUserVenues(req, res) {
        try {
            const userId = req.userId;
            const venues = await venueService.getVenuesByCreator(userId);
            return res.status(200).json({
                success: true,
                message: "User venues fetched successfully",
                data: venues,
            });
        }
        catch (error) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Failed to fetch user venues",
            });
        }
    }
    async updateVenue(req, res) {
        try {
            const userId = req.userId;
            const { venueId } = req.params;
            const venue = await venueService.updateVenue(venueId, req.body, userId);
            return res.status(200).json({
                success: true,
                message: "Venue updated successfully",
                data: venue,
            });
        }
        catch (error) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Failed to update venue",
            });
        }
    }
    async deleteVenue(req, res) {
        try {
            const userId = req.userId;
            const { venueId } = req.params;
            await venueService.deleteVenue(venueId, userId);
            return res.status(200).json({
                success: true,
                message: "Venue deleted successfully",
            });
        }
        catch (error) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Failed to delete venue",
            });
        }
    }
    async toggleVenueStatus(req, res) {
        try {
            const userId = req.userId;
            const { venueId } = req.params;
            const venue = await venueService.toggleVenueStatus(venueId, userId);
            return res.status(200).json({
                success: true,
                message: `Venue ${venue?.isActive ? 'activated' : 'deactivated'} successfully`,
                data: venue,
            });
        }
        catch (error) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Failed to toggle venue status",
            });
        }
    }
    async getAllVenuesForAdmin(req, res) {
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
        }
        catch (error) {
            return res.status(error.statusCode ?? 500).json({
                success: false,
                message: error.message || "Failed to fetch venues for admin",
            });
        }
    }
}
exports.VenueController = VenueController;
//# sourceMappingURL=venue.controller.js.map