import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";            // ✅ NEW
import { body, validationResult } from "express-validator";

import authRoutes from "./routes/authRoutes.js";
import Contact from "./models/Contact.js";
import Signup from "./models/Signup.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/telemed";

/* ─────────────────────────────────────────────────
   MIDDLEWARES
───────────────────────────────────────────────── */
app.use(cors({
  origin: [
    "http://localhost:5173",   // doctor / admin frontend
    "http://localhost:5174",   // patient frontend
  ],
  credentials: true,           // ✅ Required for cookies to work cross-origin
}));

app.use(express.json());
app.use(cookieParser());                             // ✅ Parse cookies from every request
app.use("/uploads", express.static("uploads"));     // Serve uploaded files

/* ─────────────────────────────────────────────────
   HEALTH CHECK
───────────────────────────────────────────────── */
app.get("/health", (req, res) => {
  res.json({ ok: true, dbState: mongoose.connection.readyState });
});

/* ─────────────────────────────────────────────────
   CONTACT FORM API
───────────────────────────────────────────────── */
app.post(
  "/api/contact",
  [
    body("name").notEmpty().withMessage("Name required"),
    body("email").isEmail().withMessage("Valid email required"),
    body("message").notEmpty().withMessage("Message required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    try {
      const { name, email, phone, subject, message, agree } = req.body;
      const c = new Contact({ name, email, phone, subject, message, agree: !!agree });
      const saved = await c.save();
      return res.status(201).json({ message: "Contact saved", id: saved._id });
    } catch (err) {
      console.error("Save error:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

/* ─────────────────────────────────────────────────
   AUTH ROUTES
───────────────────────────────────────────────── */
app.use("/api/auth", authRoutes);

/* ─────────────────────────────────────────────────
   ALL USERS (quick admin view)
───────────────────────────────────────────────── */
app.get("/api/users", async (req, res) => {
  try {
    const users = await Signup.find();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ─────────────────────────────────────────────────
   CONNECT DB & START SERVER
───────────────────────────────────────────────── */
mongoose
  .connect(MONGO_URL)
  .then(() => {
    console.log("✅ MongoDB Connected to Telemed");
    app.listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });