import { Request, Response } from "express";
export declare class ChatController {
    getUserUnreadCount(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getAllChats(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getUserChat(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getChatHistory(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getChatUsers(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    sendUserMessage(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    sendAdminMessage(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=chat.controller.d.ts.map