import mongoose, { Document } from "mongoose";
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
export declare const PaymentModel: mongoose.Model<IPayment, {}, {}, {}, mongoose.Document<unknown, {}, IPayment, {}, mongoose.DefaultSchemaOptions> & IPayment & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IPayment>;
//# sourceMappingURL=payment.model.d.ts.map