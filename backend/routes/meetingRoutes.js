import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import sendEmail from "../utils/sendEmail.js";
import { meetingInviteTemplate } from "../utils/meetingEmailTemplate.js";

const router = express.Router();

// In-memory store for meetings (swap with MongoDB if you want persistence)
// Structure: { roomId: { password, doctorId, createdAt } }
const meetings = new Map();

/**
 * POST /api/meetings/send-invite
 * Doctor sends meeting invite email to patient
 * Body: { patientEmail, patientName, roomId, password, doctorName }
 */
router.post("/send-invite", protect, async (req, res) => {
  try {
    const { patientEmail, patientName, roomId, password, doctorName } = req.body;

    if (!patientEmail || !roomId || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Save meeting credentials
    meetings.set(roomId.toUpperCase(), {
      password,
      doctorId: req.user?.id,
      doctorName,
      createdAt: Date.now(),
    });

    // Send email
    await sendEmail({
      email: patientEmail,
      subject: `Video Consultation Invite from Dr. ${doctorName}`,
      html: meetingInviteTemplate({
        patientName: patientName || "Patient",
        doctorName,
        roomId: roomId.toUpperCase(),
        password,
      }),
    });

    res.json({ success: true, message: "Invite email sent successfully" });
  } catch (error) {
    console.error("Meeting invite error:", error.message);
    res.status(500).json({ message: "Failed to send invite email" });
  }
});

/**
 * POST /api/meetings/verify
 * Patient verifies meeting credentials before joining
 * Body: { roomId, password }
 */
router.post("/verify", protect, async (req, res) => {
  try {
    const { roomId, password } = req.body;

    if (!roomId || !password) {
      return res.status(400).json({ valid: false, message: "Missing credentials" });
    }

    const meeting = meetings.get(roomId.toUpperCase());

    if (!meeting) {
      return res.status(404).json({ valid: false, message: "Meeting not found" });
    }

    // Clean up meetings older than 24 hours
    const AGE_LIMIT = 24 * 60 * 60 * 1000;
    if (Date.now() - meeting.createdAt > AGE_LIMIT) {
      meetings.delete(roomId.toUpperCase());
      return res.status(410).json({ valid: false, message: "Meeting has expired" });
    }

    if (meeting.password !== password) {
      return res.status(401).json({ valid: false, message: "Incorrect password" });
    }

    res.json({ valid: true, doctorName: meeting.doctorName });
  } catch (error) {
    console.error("Meeting verify error:", error.message);
    res.status(500).json({ valid: false, message: "Server error" });
  }
});

export default router;
