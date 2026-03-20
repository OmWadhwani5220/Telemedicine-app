import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getPatientProfile,
  updatePatientProfile,
  getVerifiedDoctors,
  bookAppointment,
  getMyAppointments,
} from "../controllers/patientController.js";

const router = express.Router();

/* ── PATIENT PROFILE ── */
router.get("/profile",  protect, getPatientProfile);
router.put("/profile",  protect, updatePatientProfile);

/* ── DOCTORS (verified only) ── */
router.get("/doctors",  protect, getVerifiedDoctors);

/* ── APPOINTMENTS ── */
router.post("/appointments", protect, bookAppointment);
router.get("/appointments",  protect, getMyAppointments);

export default router;