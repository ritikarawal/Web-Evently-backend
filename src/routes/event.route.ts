import { Router } from "express";
import { EventController } from "../controllers/event.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();
const eventController = new EventController();

// Public routes
router.get("/", eventController.getAllEvents);

// Protected routes - Define JOIN/LEAVE before generic :eventId routes
router.post("/:eventId/join", authMiddleware, eventController.joinEvent);
router.post("/:eventId/leave", authMiddleware, eventController.leaveEvent);
router.put("/:eventId/budget-response", authMiddleware, eventController.respondToBudgetProposal);
router.get("/:eventId/budget-history", authMiddleware, eventController.getBudgetNegotiationHistory);

// Protected CRUD routes
router.use(authMiddleware);
router.post("/", eventController.createEvent);
router.get("/user/my-events", eventController.getUserEvents);
router.put("/:eventId", eventController.updateEvent);
router.delete("/:eventId", eventController.deleteEvent);

// Generic public route (GET single event) - placed last to avoid conflicts
router.get("/:eventId", eventController.getEvent);

export default router;
