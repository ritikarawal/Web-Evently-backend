import { Router } from "express";
import { adminMiddleware, authorizedMiddleware } from "../../middlewares/authorized.middleware";
import { AdminEventController } from "../../controllers/admin/event.controller";

const router = Router();
const adminEventController = new AdminEventController();

router.use(authorizedMiddleware);
router.use(adminMiddleware);

router.get("/pending", adminEventController.getPendingEvents);
router.put("/:eventId/approve", adminEventController.approveEvent);
router.put("/:eventId/decline", adminEventController.declineEvent);
router.get("/", adminEventController.getAllEvents);

export default router;