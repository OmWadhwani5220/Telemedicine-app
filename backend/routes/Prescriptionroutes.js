// backend/routes/prescriptionRoutes.js
//
// Register in backend/index.js:
//   import prescriptionRoutes from "./routes/prescriptionRoutes.js";
//   app.use("/api/prescriptions", prescriptionRoutes);

import express        from "express";
import { protect }    from "../middleware/authMiddleware.js";
import Prescription   from "../models/Prescription.js";
import { encrypt, decrypt } from "../utils/encryption.js";

const router = express.Router();

// ── POST /api/prescriptions ────────────────────────────────────────────────────
// Doctor saves / updates prescription during or after call
// Body: { meetingId, patientEmail, patientName, prescription: { diagnosis, medications, instructions, followUpDate, notes } }
router.post("/", protect, async (req, res) => {
  try {
    const { meetingId, patientEmail, patientName, prescription } = req.body;

    if (!meetingId || !patientEmail || !prescription) {
      return res.status(400).json({ message: "meetingId, patientEmail and prescription are required" });
    }

    // Encrypt the prescription object
    const encrypted = encrypt(prescription);

    // Upsert — doctor can save multiple times during call (last write wins)
    const doc = await Prescription.findOneAndUpdate(
      { meetingId: meetingId.toUpperCase(), patientEmail: patientEmail.toLowerCase() },
      {
        doctorUserId:  req.user.id,
        doctorName:    req.user.name || req.body.doctorName || "Doctor",
        patientName:   patientName || "",
        encryptedData: encrypted.encryptedData,
        iv:            encrypted.iv,
        authTag:       encrypted.authTag,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ success: true, id: doc._id, message: "Prescription saved" });
  } catch (err) {
    console.error("Prescription save error:", err.message);
    res.status(500).json({ message: "Failed to save prescription", detail: err.message });
  }
});

// ── GET /api/prescriptions/my ─────────────────────────────────────────────────
// Patient fetches all their prescriptions (decrypted)
router.get("/my", protect, async (req, res) => {
  try {
    // Patient's email is on req.user (decoded from JWT via protect middleware)
    // The Signup model stores email, so we can use it here
    const { email } = req.user;

    if (!email) {
      return res.status(400).json({ message: "Cannot determine patient email from token" });
    }

    const records = await Prescription.find({ patientEmail: email.toLowerCase() })
      .sort({ createdAt: -1 })
      .lean();

    const decrypted = records.map(r => ({
      _id:          r._id,
      meetingId:    r.meetingId,
      doctorName:   r.doctorName,
      patientName:  r.patientName,
      prescription: decrypt({ encryptedData: r.encryptedData, iv: r.iv, authTag: r.authTag }),
      createdAt:    r.createdAt,
      updatedAt:    r.updatedAt,
    }));

    res.json({ prescriptions: decrypted });
  } catch (err) {
    console.error("Prescription fetch error:", err.message);
    res.status(500).json({ message: "Failed to fetch prescriptions" });
  }
});

// ── GET /api/prescriptions/meeting/:meetingId ──────────────────────────────────
// Doctor or patient fetches prescription for a specific meeting
router.get("/meeting/:meetingId", protect, async (req, res) => {
  try {
    const record = await Prescription.findOne({
      meetingId: req.params.meetingId.toUpperCase(),
    }).lean();

    if (!record) return res.status(404).json({ message: "No prescription found for this meeting" });

    const prescription = decrypt({
      encryptedData: record.encryptedData,
      iv:            record.iv,
      authTag:       record.authTag,
    });

    res.json({
      _id:         record._id,
      meetingId:   record.meetingId,
      doctorName:  record.doctorName,
      patientName: record.patientName,
      patientEmail:record.patientEmail,
      prescription,
      createdAt:   record.createdAt,
      updatedAt:   record.updatedAt,
    });
  } catch (err) {
    console.error("Prescription fetch error:", err.message);
    res.status(500).json({ message: "Failed to fetch prescription" });
  }
});

export default router;