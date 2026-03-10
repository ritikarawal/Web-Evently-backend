import { Request, Response } from "express";
export declare class PaymentController {
    private notifyPaymentSuccess;
    createPayment(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getPaymentsByUser(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getPaymentsByEvent(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=payment.controller.d.ts.map