import { Router } from "express";
import { TicketController } from "../controllers/ticket.controller";

const router = Router();
const ticketController = new TicketController();

// Create a ticket for an event/user
router.post("/create", ticketController.createTicket);
// Get a ticket for an event/user
router.get("/:eventId/:userId", ticketController.getTicket);
// Check-in with QR code
router.post("/checkin", ticketController.checkIn);

export default router;
