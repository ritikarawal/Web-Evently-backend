"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VenueService = void 0;
const venue_model_1 = require("../../domain/entities/venue.model");
const notification_service_1 = require("./notification.service");
class VenueService {
    constructor() {
        this.notificationService = new notification_service_1.NotificationService();
    }
    async createVenue(data, createdBy) {
        try {
            const venue = new venue_model_1.VenueModel({
                ...data,
                createdBy
            });
            await venue.save();
            // Notify users who are interested in this category via their event history.
            if (venue.recommendedCategory) {
                try {
                    await this.notificationService.notifyUsersForNewVenueByCategory(venue.recommendedCategory, venue.name);
                }
                catch (notificationError) {
                    console.error("Failed to send new venue notifications:", notificationError);
                }
            }
            return venue;
        }
        catch (error) {
            throw {
                statusCode: 400,
                message: error.message || "Failed to create venue",
            };
        }
    }
    async getVenueById(venueId) {
        try {
            const venue = await venue_model_1.VenueModel.findById(venueId).populate("createdBy", "username email firstName lastName");
            return venue;
        }
        catch (error) {
            throw {
                statusCode: 400,
                message: "Invalid venue ID",
            };
        }
    }
    async getAllVenues(filters) {
        try {
            const query = { isActive: true };
            if (filters?.city)
                query.city = { $regex: filters.city, $options: "i" };
            if (filters?.state)
                query.state = { $regex: filters.state, $options: "i" };
            if (filters?.capacity)
                query.capacity = { $gte: filters.capacity };
            if (filters?.priceRange) {
                const [min, max] = filters.priceRange.split('-');
                if (max === 'plus') {
                    query.$or = [
                        { pricePerHour: { $gte: parseInt(min) } },
                        { pricePerDay: { $gte: parseInt(min) } }
                    ];
                }
                else {
                    query.$or = [
                        { pricePerHour: { $gte: parseInt(min), $lte: parseInt(max) } },
                        { pricePerDay: { $gte: parseInt(min), $lte: parseInt(max) } }
                    ];
                }
            }
            if (filters?.amenities) {
                query.amenities = { $in: filters.amenities.split(',') };
            }
            if (filters?.search) {
                query.$or = [
                    { name: { $regex: filters.search, $options: "i" } },
                    { description: { $regex: filters.search, $options: "i" } },
                    { address: { $regex: filters.search, $options: "i" } }
                ];
            }
            if (filters?.recommendedCategory) {
                // match recommendedCategory case-insensitively
                query.recommendedCategory = { $regex: `^${filters.recommendedCategory}$`, $options: "i" };
            }
            const venues = await venue_model_1.VenueModel.find(query)
                .populate("createdBy", "username email firstName lastName")
                .sort({ rating: -1, createdAt: -1 })
                .limit(50);
            return venues;
        }
        catch (error) {
            throw {
                statusCode: 400,
                message: "Failed to fetch venues",
            };
        }
    }
    /**
     * Update venue details, including pricing array.
     * To update pricing, pass { pricing: [...] } in data.
     */
    async updateVenue(venueId, data, userId) {
        try {
            const venue = await venue_model_1.VenueModel.findById(venueId);
            if (!venue) {
                throw { statusCode: 404, message: "Venue not found" };
            }
            // Allow admin or venue creator to update
            if (userId !== "admin" && venue.createdBy.toString() !== userId) {
                throw {
                    statusCode: 403,
                    message: "Only venue creator or admin can update this venue",
                };
            }
            // If pricing is present, replace the pricing array
            const updateData = { ...data };
            if (data.pricing) {
                updateData.pricing = data.pricing;
            }
            const updatedVenue = await venue_model_1.VenueModel.findByIdAndUpdate(venueId, { $set: updateData }, { new: true }).populate("createdBy", "username email firstName lastName");
            return updatedVenue;
        }
        catch (error) {
            throw {
                statusCode: error.statusCode || 400,
                message: error.message || "Failed to update venue",
            };
        }
    }
    async deleteVenue(venueId, userId) {
        try {
            const venue = await venue_model_1.VenueModel.findById(venueId);
            if (!venue) {
                throw { statusCode: 404, message: "Venue not found" };
            }
            // Allow admin or venue creator to delete
            if (userId !== "admin" && venue.createdBy.toString() !== userId) {
                throw {
                    statusCode: 403,
                    message: "Only venue creator or admin can delete this venue",
                };
            }
            await venue_model_1.VenueModel.findByIdAndDelete(venueId);
        }
        catch (error) {
            throw {
                statusCode: error.statusCode || 400,
                message: error.message || "Failed to delete venue",
            };
        }
    }
    async getVenuesByCreator(creatorId) {
        try {
            const venues = await venue_model_1.VenueModel.find({ createdBy: creatorId })
                .populate("createdBy", "username email firstName lastName")
                .sort({ createdAt: -1 });
            return venues;
        }
        catch (error) {
            throw {
                statusCode: 400,
                message: "Failed to fetch creator venues",
            };
        }
    }
    async toggleVenueStatus(venueId, userId) {
        try {
            const venue = await venue_model_1.VenueModel.findById(venueId);
            if (!venue) {
                throw { statusCode: 404, message: "Venue not found" };
            }
            // Allow admin or venue creator to toggle status
            if (userId !== "admin" && venue.createdBy.toString() !== userId) {
                throw {
                    statusCode: 403,
                    message: "Only venue creator or admin can change venue status",
                };
            }
            const updatedVenue = await venue_model_1.VenueModel.findByIdAndUpdate(venueId, { $set: { isActive: !venue.isActive } }, { new: true }).populate("createdBy", "username email firstName lastName");
            return updatedVenue;
        }
        catch (error) {
            throw {
                statusCode: error.statusCode || 400,
                message: error.message || "Failed to toggle venue status",
            };
        }
    }
    async updateVenueRating(venueId, newRating) {
        try {
            const venue = await venue_model_1.VenueModel.findById(venueId);
            if (!venue) {
                throw { statusCode: 404, message: "Venue not found" };
            }
            // Calculate new average rating
            const currentTotalRating = venue.rating * venue.reviewCount;
            const newTotalRating = currentTotalRating + newRating;
            const newReviewCount = venue.reviewCount + 1;
            const newAverageRating = newTotalRating / newReviewCount;
            const updatedVenue = await venue_model_1.VenueModel.findByIdAndUpdate(venueId, {
                $set: {
                    rating: Math.round(newAverageRating * 10) / 10, // Round to 1 decimal
                    reviewCount: newReviewCount
                }
            }, { new: true });
            return updatedVenue;
        }
        catch (error) {
            throw {
                statusCode: error.statusCode || 400,
                message: error.message || "Failed to update venue rating",
            };
        }
    }
    async getAllVenuesForAdmin(filters) {
        try {
            const query = {}; // No isActive filter for admin
            if (filters?.status)
                query.isActive = filters.status === 'active';
            if (filters?.city)
                query.city = { $regex: filters.city, $options: "i" };
            if (filters?.creator)
                query.createdBy = filters.creator;
            const venues = await venue_model_1.VenueModel.find(query)
                .populate("createdBy", "username email firstName lastName")
                .sort({ createdAt: -1 })
                .limit(100);
            return venues;
        }
        catch (error) {
            throw {
                statusCode: 400,
                message: "Failed to fetch venues for admin",
            };
        }
    }
}
exports.VenueService = VenueService;
//# sourceMappingURL=venue.service.js.map