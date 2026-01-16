import { Router } from "express";
import { EventController } from "../controllers/event.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();
const eventController = new EventController();

// Public routes
router.get("/", eventController.getAllEvents);
router.get("/:eventId", eventController.getEvent);

// Protected routes
router.use(authMiddleware);
router.post("/", eventController.createEvent);
router.get("/user/my-events", eventController.getUserEvents);
router.put("/:eventId", eventController.updateEvent);
router.delete("/:eventId", eventController.deleteEvent);
router.post("/:eventId/join", eventController.joinEvent);
router.post("/:eventId/leave", eventController.leaveEvent);

export default router;
