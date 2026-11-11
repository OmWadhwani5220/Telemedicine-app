
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
import prescriptionRoutes from "./routes/Prescriptionroutes.js";
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

/
/* CORS CONFIGURATION */

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
    if (!origin || allowedOrigins.includes(origin.replace(/\/+$/, ""))) {
      return callback(null, true);
    }

    console.error("CORS blocked origin:", origin);
    return callback(new Error("Not allowed by CORS: " + origin));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));

/* HEALTH CHECK */

app.get("/health", (req, res) => {
  res.json({
    ok: true,
    dbState: mongoose.connection.readyState
  });
});

/* CONTACT FORM */

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
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, email, phone, subject, message, agree } = req.body;

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
      return res.status(500).json({ error: "Server error" });
    }
  }
);

/* ROUTES */

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/patient", patientRoutes);
app.use("/api/doctor", doctorRoutes);
app.use("/api/meetings", meetingRoutes);
app.use("/api/prescriptions", prescriptionRoutes);

/* ALL USERS */

app.get("/api/users", async (req, res) => {
  try {
    const users = await Signup.find();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* CONNECT DATABASE AND START SERVER */


const startServer = async () => {
  try {
    await mongoose.connect(MONGO_URL);

    console.log("MongoDB Atlas Connected Successfully");

    // Database diagnostics
    console.log("DATABASE NAME:", mongoose.connection.name);
    console.log("SIGNUP COLLECTION:", Signup.collection.name);

    const signupCount = await Signup.countDocuments();

    console.log("SIGNUP DOCUMENT COUNT:", signupCount);

    // Start server
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server listening on port ${PORT}`);
    });

  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
};


console.log(
  "JWT_SECRET loaded:",
  process.env.JWT_SECRET ? "YES" : "NO"
);

startServer();
