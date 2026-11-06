import jwt from "jsonwebtoken";
import Doctor from "../models/Doctor.js";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

export const protect = async (req, res, next) => {
  let token;

  // 1. HttpOnly cookie
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
    console.log("🍪 Token from cookie");
  }

  // 2. Authorization header
  else if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
    console.log("🔑 Token from header");
  }

  if (!token) {
    console.log("❌ No token in request");
    return res.status(401).json({
      message: "Not authorized, token missing",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    /*
     * Keep the original JWT identity.
     *
     * For normal /api/auth/login:
     * decoded.id = Signup._id
     *
     * For the older /api/doctor/login:
     * decoded.id = Doctor._id
     */
    const originalUserId = decoded.id;

    req.user = {
      ...decoded,
      userId: originalUserId,
    };

    /*
     * Doctor-specific ID resolution.
     *
     * We support BOTH existing token formats:
     *
     * 1. JWT contains Signup._id
     * 2. JWT contains Doctor._id
     *
     * This avoids breaking either authentication flow.
     */
    if (decoded.role === "doctor") {
      let doctor = null;

      // First: token may contain Doctor._id
      doctor = await Doctor.findById(originalUserId).select("_id userId");

      // Second: token may contain Signup._id
      if (!doctor) {
        doctor = await Doctor.findOne({
          userId: originalUserId,
        }).select("_id userId");
      }

      if (!doctor) {
        console.log("❌ Doctor profile not found for authenticated user");

        return res.status(404).json({
          message: "Doctor profile not found",
        });
      }

      /*
       * From this point onward:
       *
       * req.user.id       = Doctor._id
       * req.user.doctorId = Doctor._id
       * req.user.userId   = Signup._id
       */
      req.user.id = doctor._id;
      req.user.doctorId = doctor._id;

      /*
       * If the token originally contained Doctor._id,
       * recover the corresponding Signup ID.
       */
      if (!req.user.userId) {
        req.user.userId = doctor.userId;
      }

      console.log("✅ Doctor authenticated:", {
        doctorId: String(doctor._id),
        userId: String(doctor.userId),
      });
    } else {
      console.log("✅ Token valid:", decoded);
    }

    next();
  } catch (error) {
    console.log("❌ Token verify failed:", error.message);

    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};