"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const event_controller_1 = require("../controllers/event.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
const eventController = new event_controller_1.EventController();
// Public routes
router.get("/", eventController.getAllEvents);
router.get("/:eventId", eventController.getEvent);
// Protected routes
router.use(auth_middleware_1.authMiddleware);
router.post("/", eventController.createEvent);
router.get("/user/my-events", eventController.getUserEvents);
router.put("/:eventId", eventController.updateEvent);
router.delete("/:eventId", eventController.deleteEvent);
router.post("/:eventId/join", eventController.joinEvent);
router.post("/:eventId/leave", eventController.leaveEvent);
// Budget negotiation routes
router.put("/:eventId/budget-response", eventController.respondToBudgetProposal);
router.get("/:eventId/budget-history", eventController.getBudgetNegotiationHistory);
exports.default = router;
//# sourceMappingURL=event.route.js.map