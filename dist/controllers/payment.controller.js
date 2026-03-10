"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const event_model_1 = require("../domain/entities/event.model");
const user_model_1 = require("../domain/entities/user.model");
const payment_model_1 = require("../models/payment.model");
const notification_service_1 = require("../services/admin/notification.service");
function generateTransactionId() {
    return `EVT${Date.now()}${Math.floor(Math.random() * 1000)}`;
}
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
const notificationService = new notification_service_1.NotificationService();
class PaymentController {
    async notifyPaymentSuccess(params) {
        const { payerUserId, eventId, amount } = params;
        const [event, payer] = await Promise.all([
            event_model_1.EventModel.findById(eventId).select("title organizer attendees"),
            user_model_1.UserModel.findById(payerUserId).select("username firstName lastName"),
        ]);
        if (!event || !payer) {
            return;
        }
        const payerDisplayName = `${payer.firstName || ""} ${payer.lastName || ""}`.trim() ||
            payer.username ||
            "A user";
        const recipientIds = new Set();
        if (event.organizer) {
            recipientIds.add(event.organizer.toString());
        }
        if (Array.isArray(event.attendees)) {
            for (const attendee of event.attendees) {
                recipientIds.add(attendee.toString());
            }
        }
        recipientIds.delete(payerUserId);
        if (recipientIds.size === 0) {
            return;
        }
        const title = "Payment Received";
        const message = `${payerDisplayName} paid NPR ${amount} for ${event.title}.`;
        await Promise.all(Array.from(recipientIds).map((recipientId) => notificationService.createNotification(recipientId, title, message, "general", eventId)));
    }
    async createPayment(req, res) {
        try {
            const body = req.body ?? {};
            const userId = (req.userId || body.userId || "").toString();
            const eventId = (body.eventId || "").toString();
            const amount = Number(body.amount || 0);
            const paymentMethod = (body.paymentMethod || "Demo").toString();
            const cardHolderName = (body.cardHolderName || "").toString();
            const cardNumber = (body.cardNumber || "").toString();
            const expiryDate = (body.expiryDate || "").toString();
            const cvv = (body.cvv || "").toString();
            if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
                return res.status(400).json({ success: false, message: "Invalid userId" });
            }
            if (!mongoose_1.default.Types.ObjectId.isValid(eventId)) {
                return res.status(400).json({ success: false, message: "Invalid eventId" });
            }
            if (!Number.isFinite(amount) || amount <= 0) {
                return res.status(400).json({ success: false, message: "Amount must be greater than 0" });
            }
            if (!["Card", "Wallet", "Demo"].includes(paymentMethod)) {
                return res.status(400).json({ success: false, message: "Invalid payment method" });
            }
            if (paymentMethod === "Card") {
                if (!cardHolderName || !cardNumber || !expiryDate || !cvv) {
                    return res.status(400).json({ success: false, message: "Missing card details" });
                }
            }
            const event = await event_model_1.EventModel.findById(eventId);
            if (!event) {
                return res.status(404).json({ success: false, message: "Event not found" });
            }
            const existingSuccess = await payment_model_1.PaymentModel.findOne({
                userId,
                eventId,
                paymentStatus: "Success",
            }).sort({ createdAt: -1 });
            if (existingSuccess) {
                await event_model_1.EventModel.findByIdAndUpdate(eventId, {
                    $addToSet: { attendees: new mongoose_1.default.Types.ObjectId(userId) },
                });
                return res.status(200).json({
                    success: true,
                    message: "Payment already successful",
                    paymentStatus: "Success",
                    transactionId: existingSuccess.transactionId,
                });
            }
            const transactionId = generateTransactionId();
            await sleep(2000);
            const isSuccess = Math.random() < 0.8;
            const paymentStatus = isSuccess ? "Success" : "Failed";
            await payment_model_1.PaymentModel.create({
                userId,
                eventId,
                amount,
                paymentMethod,
                cardHolderName,
                cardNumber,
                expiryDate,
                cvv,
                paymentStatus,
                transactionId,
            });
            if (isSuccess) {
                await event_model_1.EventModel.findByIdAndUpdate(eventId, {
                    $addToSet: { attendees: new mongoose_1.default.Types.ObjectId(userId) },
                });
                // Keep payment flow successful even if notification creation fails.
                try {
                    await this.notifyPaymentSuccess({
                        payerUserId: userId,
                        eventId,
                        amount,
                    });
                }
                catch (notificationError) {
                    console.error("Failed to create payment notifications:", notificationError);
                }
            }
            return res.status(200).json({
                success: isSuccess,
                message: isSuccess ? "Payment successful" : "Payment failed",
                paymentStatus,
                transactionId,
            });
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: error?.message || "Failed to process payment",
            });
        }
    }
    async getPaymentsByUser(req, res) {
        try {
            const userId = req.params.userId;
            if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
                return res.status(400).json({ success: false, message: "Invalid userId" });
            }
            const payments = await payment_model_1.PaymentModel.find({ userId })
                .populate("eventId", "title category")
                .sort({ createdAt: -1 });
            return res.status(200).json({ success: true, data: payments });
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: error?.message || "Failed to fetch user payments",
            });
        }
    }
    async getPaymentsByEvent(req, res) {
        try {
            const eventId = req.params.eventId;
            if (!mongoose_1.default.Types.ObjectId.isValid(eventId)) {
                return res.status(400).json({ success: false, message: "Invalid eventId" });
            }
            const payments = await payment_model_1.PaymentModel.find({ eventId })
                .populate("userId", "username email firstName lastName")
                .sort({ createdAt: -1 });
            return res.status(200).json({ success: true, data: payments });
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: error?.message || "Failed to fetch event payments",
            });
        }
    }
}
exports.PaymentController = PaymentController;
//# sourceMappingURL=payment.controller.js.map