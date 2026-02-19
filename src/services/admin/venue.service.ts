import { VenueModel, IVenue } from "../../domain/entities/venue.model";

export class VenueService {
    async createVenue(data: Partial<IVenue>, createdBy: string): Promise<IVenue> {
        try {
            const venue = new VenueModel({
                ...data,
                createdBy
            });
            await venue.save();
            return venue;
        } catch (error: any) {
            throw {
                statusCode: 400,
                message: error.message || "Failed to create venue",
            };
        }
    }

    async getVenueById(venueId: string): Promise<IVenue | null> {
        try {
            const venue = await VenueModel.findById(venueId).populate("createdBy", "username email firstName lastName");
            return venue;
        } catch (error: any) {
            throw {
                statusCode: 400,
                message: "Invalid venue ID",
            };
        }
    }

    async getAllVenues(filters?: any): Promise<IVenue[]> {
        try {
            const query: any = { isActive: true };

            if (filters?.city) query.city = { $regex: filters.city, $options: "i" };
            if (filters?.state) query.state = { $regex: filters.state, $options: "i" };
            if (filters?.capacity) query.capacity = { $gte: filters.capacity };
            if (filters?.priceRange) {
                const [min, max] = filters.priceRange.split('-');
                if (max === 'plus') {
                    query.$or = [
                        { pricePerHour: { $gte: parseInt(min) } },
                        { pricePerDay: { $gte: parseInt(min) } }
                    ];
                } else {
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

            const venues = await VenueModel.find(query)
                .populate("createdBy", "username email firstName lastName")
                .sort({ rating: -1, createdAt: -1 })
                .limit(50);

            return venues;
        } catch (error: any) {
            throw {
                statusCode: 400,
                message: "Failed to fetch venues",
            };
        }
    }

    async updateVenue(venueId: string, data: Partial<IVenue>, userId: string): Promise<IVenue | null> {
        try {
            const venue = await VenueModel.findById(venueId);

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

            const updatedVenue = await VenueModel.findByIdAndUpdate(
                venueId,
                { $set: data },
                { new: true }
            ).populate("createdBy", "username email firstName lastName");

            return updatedVenue;
        } catch (error: any) {
            throw {
                statusCode: error.statusCode || 400,
                message: error.message || "Failed to update venue",
            };
        }
    }

    async deleteVenue(venueId: string, userId: string): Promise<void> {
        try {
            const venue = await VenueModel.findById(venueId);

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

            await VenueModel.findByIdAndDelete(venueId);
        } catch (error: any) {
            throw {
                statusCode: error.statusCode || 400,
                message: error.message || "Failed to delete venue",
            };
        }
    }

    async getVenuesByCreator(creatorId: string): Promise<IVenue[]> {
        try {
            const venues = await VenueModel.find({ createdBy: creatorId })
                .populate("createdBy", "username email firstName lastName")
                .sort({ createdAt: -1 });

            return venues;
        } catch (error: any) {
            throw {
                statusCode: 400,
                message: "Failed to fetch creator venues",
            };
        }
    }

    async toggleVenueStatus(venueId: string, userId: string): Promise<IVenue | null> {
        try {
            const venue = await VenueModel.findById(venueId);

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

            const updatedVenue = await VenueModel.findByIdAndUpdate(
                venueId,
                { $set: { isActive: !venue.isActive } },
                { new: true }
            ).populate("createdBy", "username email firstName lastName");

            return updatedVenue;
        } catch (error: any) {
            throw {
                statusCode: error.statusCode || 400,
                message: error.message || "Failed to toggle venue status",
            };
        }
    }

    async updateVenueRating(venueId: string, newRating: number): Promise<IVenue | null> {
        try {
            const venue = await VenueModel.findById(venueId);

            if (!venue) {
                throw { statusCode: 404, message: "Venue not found" };
            }

            // Calculate new average rating
            const currentTotalRating = venue.rating * venue.reviewCount;
            const newTotalRating = currentTotalRating + newRating;
            const newReviewCount = venue.reviewCount + 1;
            const newAverageRating = newTotalRating / newReviewCount;

            const updatedVenue = await VenueModel.findByIdAndUpdate(
                venueId,
                {
                    $set: {
                        rating: Math.round(newAverageRating * 10) / 10, // Round to 1 decimal
                        reviewCount: newReviewCount
                    }
                },
                { new: true }
            );

            return updatedVenue;
        } catch (error: any) {
            throw {
                statusCode: error.statusCode || 400,
                message: error.message || "Failed to update venue rating",
            };
        }
    }

    async getAllVenuesForAdmin(filters?: any): Promise<IVenue[]> {
        try {
            const query: any = {}; // No isActive filter for admin

            if (filters?.status) query.isActive = filters.status === 'active';
            if (filters?.city) query.city = { $regex: filters.city, $options: "i" };
            if (filters?.creator) query.createdBy = filters.creator;

            const venues = await VenueModel.find(query)
                .populate("createdBy", "username email firstName lastName")
                .sort({ createdAt: -1 })
                .limit(100);

            return venues;
        } catch (error: any) {
            throw {
                statusCode: 400,
                message: "Failed to fetch venues for admin",
            };
        }
    }
}