import { Router } from "express";
import { PaymentController } from "../controllers/payment.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();
const paymentController = new PaymentController();

router.use(authMiddleware);

router.post("/create", paymentController.createPayment.bind(paymentController));
router.get("/user/:userId", paymentController.getPaymentsByUser.bind(paymentController));
router.get("/event/:eventId", paymentController.getPaymentsByEvent.bind(paymentController));

export default router;
