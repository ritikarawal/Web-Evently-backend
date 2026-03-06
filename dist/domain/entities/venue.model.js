"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.VenueModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const VenueSchema = new mongoose_1.Schema({
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
    pricing: [
        {
            type: {
                type: String,
                enum: ["hourly", "daily", "custom"],
                required: true,
            },
            amount: { type: Number, required: true },
            description: { type: String },
        },
    ],
    amenities: [{ type: String }],
    images: [{ type: String }],
    // contactPerson, contactEmail, contactPhone removed
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
    recommendedCategory: { type: String },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true });
// Indexes for better performance
VenueSchema.index({ city: 1, state: 1 });
VenueSchema.index({ capacity: 1 });
VenueSchema.index({ pricePerHour: 1, pricePerDay: 1 });
VenueSchema.index({ rating: -1 });
VenueSchema.index({ isActive: 1 });
exports.VenueModel = mongoose_1.default.model("Venue", VenueSchema);
//# sourceMappingURL=venue.model.js.map