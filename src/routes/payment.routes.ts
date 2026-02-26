import axios from "axios";
import express from "express";
import { EventModel } from "../domain/entities/event.model";

const router = express.Router();

// POST /api/payments/khalti-verify
router.post("/khalti-verify", async (req, res) => {
  const { token, amount, eventId, userId } = req.body;
  if (!token || !amount || !eventId || !userId) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  try {
    // Verify with Khalti
    const khaltiResponse = await axios.post(
      "https://khalti.com/api/v2/payment/verify/",
      { token, amount },
      {
        headers: {
          Authorization: `Key YOUR_KHALTI_SECRET_KEY`, // Replace with your secret key
        },
      }
    );

    const data: any = khaltiResponse.data;
    if (data && data.idx) {
      // Mark user as paid for the event (add to attendees, or set a paid flag)
      await EventModel.findByIdAndUpdate(eventId, {
        $addToSet: { attendees: userId },
      });
      return res.json({ success: true, message: "Payment verified and user marked as attending." });
    } else {
      return res.status(400).json({ success: false, message: "Payment verification failed." });
    }
  } catch (error: any) {
    let errMsg = "Unknown error";
    if (error && typeof error === "object") {
      if (error.response && error.response.data) {
        errMsg = JSON.stringify(error.response.data);
      } else if (error.message) {
        errMsg = error.message;
      }
    }
    return res.status(400).json({ success: false, message: "Khalti verification error", error: errMsg });
  }
});

export default router;
