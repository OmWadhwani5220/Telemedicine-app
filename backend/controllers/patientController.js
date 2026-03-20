import Patient     from "../models/Patient.js";
import Doctor      from "../models/Doctor.js";
import Appointment from "../models/Appointment.js";

/* ─────────────────────────────────────────
   GET PATIENT PROFILE
───────────────────────────────────────── */
export const getPatientProfile = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user.id });
    if (!patient)
      return res.status(404).json({ message: "Patient profile not found" });
    res.json({ patient });
  } catch (err) {
    console.error("Get patient profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ─────────────────────────────────────────
   UPDATE PATIENT PROFILE
───────────────────────────────────────── */
export const updatePatientProfile = async (req, res) => {
  try {
    const {
      name,
      phone,
      dob,
      gender,
      bloodGroup,
      height,
      weight,
      hasChronicDisease,
      chronicDiseaseDetail,
      emergencyContact,
    } = req.body;

    const patient = await Patient.findOneAndUpdate(
      { userId: req.user.id },
      {
        name,
        phone,
        dob,
        gender,
        bloodGroup,
        height: height ? Number(height) : undefined,
        weight: weight ? Number(weight) : undefined,
        hasChronicDisease,
        chronicDiseaseDetail,
        emergencyContact,
      },
      { new: true, runValidators: false }
    );

    if (!patient)
      return res.status(404).json({ message: "Patient profile not found" });

    res.json({ message: "Profile updated successfully", patient });
  } catch (err) {
    console.error("Update patient profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ─────────────────────────────────────────
   GET VERIFIED DOCTORS (for appointment booking)
───────────────────────────────────────── */
export const getVerifiedDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({ isVerified: true }).select(
      "-medicalLicense -identityProof -userId"
    );
    res.json(doctors);
  } catch (err) {
    console.error("Get doctors error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ─────────────────────────────────────────
   BOOK APPOINTMENT
───────────────────────────────────────── */
export const bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, timeSlot, consultationType, notes } = req.body;

    if (!doctorId || !date || !timeSlot)
      return res.status(400).json({ message: "doctorId, date and timeSlot are required" });

    // Verify doctor exists and is verified
    const doctor = await Doctor.findById(doctorId);
    if (!doctor || !doctor.isVerified)
      return res.status(404).json({ message: "Doctor not found or not verified" });

    // Get patient profile
    const patient = await Patient.findOne({ userId: req.user.id });
    if (!patient)
      return res.status(404).json({ message: "Patient profile not found" });

    const appointment = await Appointment.create({
      patientId: patient._id,
      doctorId,
      date,
      timeSlot,
      consultationType: consultationType || "video",
      notes: notes || "",
      status: "pending",
    });

    res.status(201).json({
      message: "Appointment booked successfully",
      appointment,
    });
  } catch (err) {
    console.error("Book appointment error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ─────────────────────────────────────────
   GET MY APPOINTMENTS
───────────────────────────────────────── */
export const getMyAppointments = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user.id });
    if (!patient)
      return res.status(404).json({ message: "Patient profile not found" });

    const appointments = await Appointment.find({ patientId: patient._id })
      .populate("doctorId", "name specialization profilePhoto experience")
      .sort({ date: -1 });

    res.json(appointments);
  } catch (err) {
    console.error("Get appointments error:", err);
    res.status(500).json({ message: "Server error" });
  }
};