import { Request, Response } from "express";
export declare class EventController {
    createEvent(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getEvent(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getAllEvents(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getUserEvents(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    updateEvent(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    deleteEvent(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    joinEvent(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    leaveEvent(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    respondToBudgetProposal(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getBudgetNegotiationHistory(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=event.controller.d.ts.map