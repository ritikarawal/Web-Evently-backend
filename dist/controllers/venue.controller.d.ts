import { Request, Response } from "express";
export declare class VenueController {
    createVenue(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getVenue(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getAllVenues(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getUserVenues(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    updateVenue(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    deleteVenue(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    toggleVenueStatus(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getAllVenuesForAdmin(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=venue.controller.d.ts.map