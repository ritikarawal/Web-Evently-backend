"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authorized_middleware_1 = require("../../middlewares/authorized.middleware");
const event_controller_1 = require("../../controllers/admin/event.controller");
const router = (0, express_1.Router)();
const adminEventController = new event_controller_1.AdminEventController();
router.use(authorized_middleware_1.authorizedMiddleware);
router.use(authorized_middleware_1.adminMiddleware);
router.get("/pending", adminEventController.getPendingEvents);
router.put("/:eventId/approve", adminEventController.approveEvent);
router.put("/:eventId/decline", adminEventController.declineEvent);
router.put("/:eventId/budget-proposal", adminEventController.proposeBudget);
router.put("/:eventId/accept-user-budget", adminEventController.acceptUserBudgetProposal);
router.delete("/:eventId", adminEventController.deleteEvent);
router.get("/", adminEventController.getAllEvents);
exports.default = router;
//# sourceMappingURL=event.routes.js.map