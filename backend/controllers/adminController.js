import Doctor from "../models/Doctor.js";
import Patient from "../models/Patient.js";
import Signup from "../models/Signup.js";
import sendEmail from "../utils/sendEmail.js";

/* ================= DASHBOARD ================= */
export const getDashboardStats = async (req, res) => {
  try {
    const totalPatients = await Patient.countDocuments();
    // "Total Doctors" = every doctor registered (verified or still pending),
    // not just verified ones — otherwise a newly-added doctor never moves
    // this number until they're approved.
    const totalDoctors = await Doctor.countDocuments();
    const pendingApprovals = await Doctor.countDocuments({ isVerified: false });

    /* ---- Doctor specializations (pie chart) ---- */
    const specializationAgg = await Doctor.aggregate([
      {
        $group: {
          _id: { $ifNull: ["$specialization", "Other"] },
          value: { $sum: 1 },
        },
      },
      { $sort: { value: -1 } },
    ]);

    const specializationStats = specializationAgg.map((s) => ({
      name: s._id,
      value: s.value,
    }));

    /* ---- Monthly growth (patients + doctors registered per month) ---- */
    const MONTHS_BACK = 6;
    const now = new Date();
    const rangeStart = new Date(now.getFullYear(), now.getMonth() - (MONTHS_BACK - 1), 1);

    const monthKey = (d) => `${d.getFullYear()}-${d.getMonth()}`;
    const monthLabel = (d) => d.toLocaleDateString("en-US", { month: "short" });

    // Build the last N month buckets up front so empty months still show up
    const buckets = [];
    for (let i = 0; i < MONTHS_BACK; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - (MONTHS_BACK - 1) + i, 1);
      buckets.push({ key: monthKey(d), name: monthLabel(d), patients: 0, doctors: 0 });
    }
    const bucketByKey = Object.fromEntries(buckets.map((b) => [b.key, b]));

    const [patientsByMonth, doctorsByMonth] = await Promise.all([
      Patient.aggregate([
        { $match: { createdAt: { $gte: rangeStart } } },
        {
          $group: {
            _id: { y: { $year: "$createdAt" }, m: { $month: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
      ]),
      Doctor.aggregate([
        { $match: { createdAt: { $gte: rangeStart } } },
        {
          $group: {
            _id: { y: { $year: "$createdAt" }, m: { $month: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    patientsByMonth.forEach(({ _id, count }) => {
      const key = `${_id.y}-${_id.m - 1}`;
      if (bucketByKey[key]) bucketByKey[key].patients = count;
    });
    doctorsByMonth.forEach(({ _id, count }) => {
      const key = `${_id.y}-${_id.m - 1}`;
      if (bucketByKey[key]) bucketByKey[key].doctors = count;
    });

    const registrationStats = buckets.map(({ name, patients, doctors }) => ({
      name,
      patients,
      doctors,
    }));

    res.status(200).json({
      totalPatients,
      totalDoctors,
      pendingApprovals,
      specializationStats,
      registrationStats,
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ================= USERS ================= */
export const getAllUsers = async (req, res) => {
  try {
    const patients = await Patient.find()
      .select("name email createdAt")
      .sort({ createdAt: -1 });

    res.status(200).json(patients);
  } catch (error) {
    console.error("Users Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ================= DOCTORS ================= */
export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().sort({ createdAt: -1 });
    res.status(200).json(doctors);
  } catch (error) {
    console.error("Doctors Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ================= APPROVE DOCTOR ================= */
export const approveDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const doctor = await Doctor.findByIdAndUpdate(
      doctorId,
      {
        isVerified: true,
        rejectionReason: "",
      },
      { new: true }
    );

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // ✅ UPDATE USER TABLE
    await Signup.findByIdAndUpdate(doctor.userId, {
      isVerified: true,
    });

    // ✅ EMAIL (SAFE)
    try {
      await sendEmail({
        email: doctor.email,
        subject: "Telemed Account Approved ✅",
        message: `Hello ${doctor.name},

Your profile has been approved.

You can now login.

Telemed Team`,
      });
    } catch (e) {
      console.error("Email error:", e.message);
    }

    return res.status(200).json({
      message: "Doctor approved successfully",
      doctor,
    });

  } catch (error) {
    console.error("Approve Error:", error);
    return res.status(500).json({ message: "Internal server error in email" });
  }
};

/* ================= REJECT DOCTOR ================= */
export const rejectDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ message: "Rejection reason required" });
    }

    const doctor = await Doctor.findByIdAndUpdate(
      doctorId,
      {
        isVerified: false,
        rejectionReason: reason,
      },
      { new: true }
    );

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // ✅ UPDATE USER TABLE
    await Signup.findByIdAndUpdate(doctor.userId, {
      isVerified: false,
    });

    // ✅ EMAIL
    try {
      await sendEmail({
        email: doctor.email,
        subject: "Telemed Profile Rejected ❌",
        message: `Hello ${doctor.name},

Your profile has been rejected.

Reason: ${reason}

Please update and try again.`,
      });
    } catch (e) {
      console.error("Email error:", e.message);
    }

    return res.status(200).json({
      message: "Doctor rejected successfully",
      doctor,
    });

  } catch (error) {
    console.error("Reject Error:", error);
    return res.status(500).json({ message: "Internal server error In emil" });
  }
};

/* ================= DELETE DOCTOR ================= */
export const deleteDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const doctor = await Doctor.findByIdAndDelete(doctorId);

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // ✅ DELETE USER ALSO
    await Signup.findByIdAndDelete(doctor.userId);

    return res.status(200).json({
      message: "Doctor and user deleted successfully",
    });

  } catch (error) {
    console.error("Delete Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};