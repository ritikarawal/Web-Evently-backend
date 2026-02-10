import { Router } from "express";
import { VenueController } from "../controllers/venue.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();
const venueController = new VenueController();

// Public routes
router.get("/", venueController.getAllVenues);
router.get("/:venueId", venueController.getVenue);

// Protected routes
router.use(authMiddleware);
router.post("/", venueController.createVenue);
router.get("/user/my-venues", venueController.getUserVenues);
router.put("/:venueId", venueController.updateVenue);
router.delete("/:venueId", venueController.deleteVenue);
router.patch("/:venueId/toggle-status", venueController.toggleVenueStatus);

export default router;