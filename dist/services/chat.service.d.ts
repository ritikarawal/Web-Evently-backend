import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
export declare class ChatSocketService {
    private io;
    private static ioRef;
    private activeUsers;
    constructor(httpServer: HTTPServer);
    private initializeListeners;
    getIO(): SocketIOServer;
    static emitUserMessageToAdmins(payload: {
        userId: string;
        message: string;
        username?: string;
        senderName?: string;
        timestamp: Date;
    }): void;
    static emitAdminMessageToUser(userId: string, payload: {
        message: string;
        adminName?: string;
        timestamp: Date;
    }): void;
}
//# sourceMappingURL=chat.service.d.ts.map