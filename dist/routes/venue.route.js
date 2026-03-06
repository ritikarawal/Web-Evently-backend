"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const venue_controller_1 = require("../controllers/venue.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
const venueController = new venue_controller_1.VenueController();
// Public routes
router.get("/", venueController.getAllVenues);
router.get("/:venueId", venueController.getVenue);
// Protected routes
router.use(auth_middleware_1.authMiddleware);
router.post("/", venueController.createVenue);
router.get("/user/my-venues", venueController.getUserVenues);
router.put("/:venueId", venueController.updateVenue);
router.delete("/:venueId", venueController.deleteVenue);
router.patch("/:venueId/toggle-status", venueController.toggleVenueStatus);
exports.default = router;
//# sourceMappingURL=venue.route.js.map