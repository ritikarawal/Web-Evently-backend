import mongoose, { Schema, Document } from "mongoose";

export interface IVenue extends Document {
    name: string;
    address: string;
    city: string;
    description?: string;
    state?: string;
    zipCode?: string;
    country: string;
    capacity: number;
    pricePerHour?: number;
    pricePerDay?: number;
    amenities: string[];
    images: string[];
    contactPerson: string;
    contactEmail: string;
    contactPhone: string;
    availability: {
        monday: { open: string; close: string; available: boolean };
        tuesday: { open: string; close: string; available: boolean };
        wednesday: { open: string; close: string; available: boolean };
        thursday: { open: string; close: string; available: boolean };
        friday: { open: string; close: string; available: boolean };
        saturday: { open: string; close: string; available: boolean };
        sunday: { open: string; close: string; available: boolean };
    };
    rating: number;
    reviewCount: number;
    isActive: boolean;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const VenueSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        description: { type: String },
        address: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String },
        zipCode: { type: String },
        country: { type: String, required: true },
        capacity: { type: Number, required: true },
        pricePerHour: { type: Number },
        pricePerDay: { type: Number },
        amenities: [{ type: String }],
        images: [{ type: String }],
        contactPerson: { type: String, required: true },
        contactEmail: { type: String, required: true },
        contactPhone: { type: String, required: true },
        availability: {
            monday: {
                open: { type: String, default: "09:00" },
                close: { type: String, default: "17:00" },
                available: { type: Boolean, default: true }
            },
            tuesday: {
                open: { type: String, default: "09:00" },
                close: { type: String, default: "17:00" },
                available: { type: Boolean, default: true }
            },
            wednesday: {
                open: { type: String, default: "09:00" },
                close: { type: String, default: "17:00" },
                available: { type: Boolean, default: true }
            },
            thursday: {
                open: { type: String, default: "09:00" },
                close: { type: String, default: "17:00" },
                available: { type: Boolean, default: true }
            },
            friday: {
                open: { type: String, default: "09:00" },
                close: { type: String, default: "17:00" },
                available: { type: Boolean, default: true }
            },
            saturday: {
                open: { type: String, default: "09:00" },
                close: { type: String, default: "17:00" },
                available: { type: Boolean, default: true }
            },
            sunday: {
                open: { type: String, default: "09:00" },
                close: { type: String, default: "17:00" },
                available: { type: Boolean, default: false }
            }
        },
        rating: { type: Number, default: 0, min: 0, max: 5 },
        reviewCount: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    { timestamps: true }
);

// Indexes for better performance
VenueSchema.index({ city: 1, state: 1 });
VenueSchema.index({ capacity: 1 });
VenueSchema.index({ pricePerHour: 1, pricePerDay: 1 });
VenueSchema.index({ rating: -1 });
VenueSchema.index({ isActive: 1 });

export const VenueModel = mongoose.model<IVenue>("Venue", VenueSchema);