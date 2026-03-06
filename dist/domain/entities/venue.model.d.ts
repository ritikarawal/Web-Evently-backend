import mongoose, { Document } from "mongoose";
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
    pricing?: Array<{
        type: string;
        amount: number;
        description?: string;
    }>;
    amenities: string[];
    images: string[];
    availability: {
        monday: {
            open: string;
            close: string;
            available: boolean;
        };
        tuesday: {
            open: string;
            close: string;
            available: boolean;
        };
        wednesday: {
            open: string;
            close: string;
            available: boolean;
        };
        thursday: {
            open: string;
            close: string;
            available: boolean;
        };
        friday: {
            open: string;
            close: string;
            available: boolean;
        };
        saturday: {
            open: string;
            close: string;
            available: boolean;
        };
        sunday: {
            open: string;
            close: string;
            available: boolean;
        };
    };
    rating: number;
    reviewCount: number;
    isActive: boolean;
    recommendedCategory?: string;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const VenueModel: mongoose.Model<IVenue, {}, {}, {}, mongoose.Document<unknown, {}, IVenue, {}, mongoose.DefaultSchemaOptions> & IVenue & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IVenue>;
//# sourceMappingURL=venue.model.d.ts.map