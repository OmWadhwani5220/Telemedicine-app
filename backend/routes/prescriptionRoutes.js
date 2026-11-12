
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import Prescription from "../models/prescription.js";
import Signup from "../models/Signup.js";
import { encrypt, decrypt } from "../utils/encryption.js";

const router = express.Router();

// POST /api/prescriptions
// Doctor saves or updates a prescription
router.post("/", protect, async (req, res) => {
  try {
    if (req.user.role !== "doctor") {
      return res.status(403).json({
        success: false,
        message: "Only doctors can save prescriptions"
      });
    }

    const {
      meetingId,
      patientEmail,
      patientName,
      doctorName,
      prescription
    } = req.body || {};

    if (!meetingId || !patientEmail || !prescription) {
      return res.status(400).json({
        success: false,
        message: "meetingId, patientEmail and prescription are required"
      });
    }

    // Use original Signup user ID, not Doctor profile ID
    const doctorUserId = req.user.userId || req.user.id;

    const encrypted = encrypt(prescription);

    const doc = await Prescription.findOneAndUpdate(
      {
        meetingId: meetingId.trim().toUpperCase(),
        patientEmail: patientEmail.trim().toLowerCase()
      },
      {
        doctorUserId,
        doctorName: req.user.name || doctorName || "Doctor",
        patientName: patientName || "",
        encryptedData: encrypted.encryptedData,
        iv: encrypted.iv,
        authTag: encrypted.authTag
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
        setDefaultsOnInsert: true
      }
    );

    return res.status(200).json({
      success: true,
      id: doc._id,
      message: "Prescription saved successfully"
    });

  } catch (err) {
    console.error("Prescription save error:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to save prescription",
      detail: err.message
    });
  }
});


// GET /api/prescriptions/my
// Patient fetches their prescriptions
router.get("/my", protect, async (req, res) => {
  try {
    if (req.user.role !== "patient") {
      return res.status(403).json({
        success: false,
        message: "Only patients can access this endpoint"
      });
    }

    const userId = req.user.userId || req.user.id;

    const user = await Signup.findById(userId).select("email");

    if (!user?.email) {
      return res.status(404).json({
        success: false,
        message: "Patient account or email not found"
      });
    }

    const records = await Prescription.find({
      patientEmail: user.email.toLowerCase()
    })
      .sort({ createdAt: -1 })
      .lean();

    const decrypted = records.map(record => ({
      _id: record._id,
      meetingId: record.meetingId,
      doctorName: record.doctorName,
      patientName: record.patientName,
      prescription: decrypt({
        encryptedData: record.encryptedData,
        iv: record.iv,
        authTag: record.authTag
      }),
      createdAt: record.createdAt,
      updatedAt: record.updatedAt
    }));

    return res.json({
      success: true,
      prescriptions: decrypted
    });

  } catch (err) {
    console.error("Prescription fetch error:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch prescriptions"
    });
  }
});


// GET /api/prescriptions/meeting/:meetingId
// Fetch prescription for a meeting
router.get("/meeting/:meetingId", protect, async (req, res) => {
  try {
    const record = await Prescription.findOne({
      meetingId: req.params.meetingId.trim().toUpperCase()
    }).lean();

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "No prescription found for this meeting"
      });
    }

    // Verify that the requesting user is the relevant doctor or patient
    const userId = req.user.userId || req.user.id;

    if (req.user.role === "doctor") {
      if (String(record.doctorUserId) !== String(userId)) {
        return res.status(403).json({
          success: false,
          message: "You cannot access this prescription"
        });
      }
    } else if (req.user.role === "patient") {
      const user = await Signup.findById(userId).select("email");

      if (
        !user?.email ||
        user.email.toLowerCase() !== record.patientEmail.toLowerCase()
      ) {
        return res.status(403).json({
          success: false,
          message: "You cannot access this prescription"
        });
      }
    } else {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    const prescription = decrypt({
      encryptedData: record.encryptedData,
      iv: record.iv,
      authTag: record.authTag
    });

    return res.json({
      success: true,
      _id: record._id,
      meetingId: record.meetingId,
      doctorName: record.doctorName,
      patientName: record.patientName,
      patientEmail: record.patientEmail,
      prescription,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt
    });

  } catch (err) {
    console.error("Prescription fetch error:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch prescription"
    });
  }
});

export default router;
