import { Request, Response } from "express";
export declare class AdminEventController {
    getPendingEvents(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    approveEvent(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    declineEvent(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    deleteEvent(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getAllEvents(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    proposeBudget(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    acceptUserBudgetProposal(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=event.controller.d.ts.map