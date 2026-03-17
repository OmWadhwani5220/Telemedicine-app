import express from "express";
import upload from "../middleware/upload.js";
import { protect } from "../middleware/authMiddleware.js";
import { signup, login, getAllUsers } from "../controllers/authController.js";
import Signup from "../models/Signup.js";   // ⭐ import user model

const router = express.Router();


// SIGNUP ROUTE → supports patient & doctor file uploads
router.post(
  "/signup",
  upload.fields([
    { name: "profilePhoto", maxCount: 1 },
    { name: "medicalLicense", maxCount: 1 },
    { name: "identityProof", maxCount: 1 },            
  ]),
  signup
);


// LOGIN ROUTE
router.post("/login", login);


// PROFILE ROUTE → get logged in user info
router.get("/profile", protect, async (req, res) => {
  try {

    const user = await Signup.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.json({
      message: "Profile fetched successfully",
      user
    });

  } catch (error) {

    console.error("Profile error:", error);

    res.status(500).json({
      message: "Server error"
    });

  }
});


// ADMIN or internal route → GET all users
router.get("/all", getAllUsers);


export default router;