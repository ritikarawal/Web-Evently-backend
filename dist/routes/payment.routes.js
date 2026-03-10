"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payment_controller_1 = require("../controllers/payment.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
const paymentController = new payment_controller_1.PaymentController();
router.use(auth_middleware_1.authMiddleware);
router.post("/create", paymentController.createPayment.bind(paymentController));
router.get("/user/:userId", paymentController.getPaymentsByUser.bind(paymentController));
router.get("/event/:eventId", paymentController.getPaymentsByEvent.bind(paymentController));
exports.default = router;
//# sourceMappingURL=payment.routes.js.map