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
exports.EventModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const EventSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    location: { type: String, required: true },
    category: {
        type: String,
        enum: ["birthday", "anniversary", "wedding", "engagement", "workshop", "conference", "graduation", "fundraisers", "music", "sports", "education", "business", "entertainment", "other"],
        default: "other"
    },
    eventImage: { type: String },
    capacity: { type: Number },
    ticketPrice: { type: Number, default: 0 },
    eventType: { type: String, enum: ['paid', 'free'], default: 'free' },
    organizer: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    attendees: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    isPublic: { type: Boolean, default: true },
    status: {
        type: String,
        enum: ["draft", "published", "cancelled", "pending", "approved", "declined"],
        default: "draft"
    },
    adminNotes: { type: String },
    // Budget negotiation fields
    proposedBudget: { type: Number },
    adminProposedBudget: { type: Number },
    finalBudget: { type: Number },
    budgetStatus: {
        type: String,
        enum: ["pending", "negotiating", "accepted", "rejected"],
        default: "pending"
    },
    budgetNegotiationHistory: [{
            proposer: {
                type: String,
                enum: ["user", "admin"],
                required: true
            },
            proposerId: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: "User"
            },
            amount: { type: Number, required: true },
            message: { type: String },
            timestamp: { type: Date, default: Date.now }
        }],
}, { timestamps: true });
exports.EventModel = mongoose_1.default.model("Event", EventSchema);
//# sourceMappingURL=event.model.js.map