import mongoose, { Document, Schema } from "mongoose";

export interface IPayment extends Document {
  userId: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  amount: number;
  paymentMethod: "Card" | "Wallet" | "Demo";
  cardHolderName: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  paymentStatus: "Pending" | "Success" | "Failed";
  transactionId: string;
  createdAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    amount: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ["Card", "Wallet", "Demo"],
      default: "Demo",
      required: true,
    },
    cardHolderName: { type: String, default: "" },
    cardNumber: { type: String, default: "" },
    expiryDate: { type: String, default: "" },
    cvv: { type: String, default: "" },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Success", "Failed"],
      default: "Pending",
      required: true,
    },
    transactionId: { type: String, required: true, unique: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

PaymentSchema.index({ userId: 1, eventId: 1, createdAt: -1 });

export const PaymentModel = mongoose.model<IPayment>("Payment", PaymentSchema);
