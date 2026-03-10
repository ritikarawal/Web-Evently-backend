import mongoose, { Document } from "mongoose";
export interface IChat extends Document {
    userId: mongoose.Types.ObjectId;
    adminId?: mongoose.Types.ObjectId;
    messages: Array<{
        _id?: mongoose.Types.ObjectId;
        from: "user" | "admin";
        text: string;
        timestamp: Date;
        isRead: boolean;
        username?: string;
        senderName?: string;
    }>;
    createdAt: Date;
    updatedAt: Date;
}
export declare const ChatModel: mongoose.Model<IChat, {}, {}, {}, mongoose.Document<unknown, {}, IChat, {}, mongoose.DefaultSchemaOptions> & IChat & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IChat>;
//# sourceMappingURL=chat.model.d.ts.map