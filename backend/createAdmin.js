
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import Signup from "./models/Signup.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URL;

const createAdmin = async () => {
  try {
    if (!MONGO_URI) {
      throw new Error("MONGO_URL is missing from environment variables");
    }

    await mongoose.connect(MONGO_URI);

    console.log("MongoDB Connected Successfully");

    const existingAdmin = await Signup.findOne({
      email: "admin@gmail.com",
    });

    if (existingAdmin) {
      console.log("Admin already exists");
      return;
    }

    const hashedPassword = await bcrypt.hash(
      process.env.ADMIN_PASSWORD || "admin123",
      10
    );

    const admin = new Signup({
      name: "Super Admin",
      email: "admin@gmail.com",
      password: hashedPassword,
      role: "admin",
    });

    await admin.save();

    console.log("Admin created successfully!");
  } catch (error) {
    console.error("Admin creation failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

createAdmin();
