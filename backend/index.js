
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { body, validationResult } from "express-validator";

import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import patientRoutes from "./routes/patientRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import meetingRoutes from "./routes/meetingRoutes.js";
import prescriptionRoutes from "./routes/prescriptionRoutes.js";
import Contact from "./models/Contact.js";
import Signup from "./models/Signup.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URL = process.env.MONGO_URL;

if (!MONGO_URL) {
  console.error("MONGO_URL is missing from environment variables");
  process.exit(1);
}

/* ===============================
   CORS CONFIGURATION
================================ */

const allowedOrigins = [
  "https://telemedicine-app-six-beryl.vercel.app",
  "https://telemed-user-panel.vercel.app",
  "https://telemed-doctor-panel.vercel.app",
  "https://telemed-admin-panel.vercel.app",

  ...(process.env.FRONTEND_URLS || "")
    .split(",")
    .map(url => url.trim())
    .filter(Boolean)
].map(url => url.replace(/\/+$/, ""));

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests without an Origin header
    if (!origin) {
      return callback(null, true);
    }

    const normalizedOrigin = origin.replace(/\/+$/, "");

    if (allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }

    console.error("CORS blocked origin:", origin);

    return callback(
      new Error("Not allowed by CORS: " + origin)
    );
  },

  credentials: true,

  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS"
  ],

  allowedHeaders: [
    "Content-Type",
    "Authorization"
  ],

  optionsSuccessStatus: 204
};

// CORS must be registered before API routes
app.use(cors(corsOptions));
app.use("/api/prescriptions", prescriptionRoutes);
// Handle preflight requests
app.options(/.*/, cors(corsOptions));

/* ===============================
   MIDDLEWARE
================================ */

app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));

/* ===============================
   HEALTH CHECK
================================ */

app.get("/health", (req, res) => {
  res.json({
    ok: true,
    dbState: mongoose.connection.readyState,
    database: mongoose.connection.name
  });
});

/* ===============================
   CONTACT FORM
================================ */

app.post(
  "/api/contact",
  [
    body("name").notEmpty().withMessage("Name required"),
    body("email").isEmail().withMessage("Valid email required"),
    body("message").notEmpty().withMessage("Message required")
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      });
    }

    try {
      const {
        name,
        email,
        phone,
        subject,
        message,
        agree
      } = req.body;

      const contact = new Contact({
        name,
        email,
        phone,
        subject,
        message,
        agree: !!agree
      });

      const saved = await contact.save();

      return res.status(201).json({
        message: "Contact saved",
        id: saved._id
      });

    } catch (err) {
      console.error("Save error:", err);

      return res.status(500).json({
        error: "Server error"
      });
    }
  }
);

/* ===============================
   API ROUTES
================================ */

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/patient", patientRoutes);
app.use("/api/doctor", doctorRoutes);
app.use("/api/meetings", meetingRoutes);

/* ===============================
   ALL USERS
================================ */

app.get("/api/users", async (req, res) => {
  try {
    const users = await Signup.find().select("-password");

    res.json(users);

  } catch (err) {
    console.error("Get users error:", err);

    res.status(500).json({
      message: "Server error"
    });
  }
});

/* ===============================
   DATABASE CONNECTION
================================ */


const startServer = async () => {
  try {
    await mongoose.connect(MONGO_URL, {
      dbName: "telemed"
    });

    console.log("MongoDB Atlas Connected Successfully");

    // Database diagnostics
    console.log(
      "DATABASE NAME:",
      mongoose.connection.name
    );

    console.log(
      "USER COLLECTION:",
      Signup.collection.name
    );

    const userCount = await Signup.countDocuments();

    console.log(
      "TOTAL USERS:",
      userCount
    );

    // Verify users collection
    if (Signup.collection.name !== "users") {
      throw new Error(
        `Wrong collection! Expected users, connected to ${Signup.collection.name}`
      );
    }

    // Frontend CORS diagnostics
    console.log(
      "ALLOWED FRONTEND ORIGINS:",
      allowedOrigins
    );

    // Start server
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server listening on port ${PORT}`);
    });

  } catch (err) {
    console.error(
      "MongoDB connection error:",
      err.message
    );

    process.exit(1);
  }
};


/* ===============================
   ENVIRONMENT CHECK
================================ */

console.log(
  "JWT_SECRET loaded:",
  process.env.JWT_SECRET ? "YES" : "NO"
);

startServer();
