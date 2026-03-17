import jwt from "jsonwebtoken";

// ✅ MUST match authController.js secret exactly
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";
export const protect = (req, res, next) => {
  let token;

  // 1st — HttpOnly cookie
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  // 2nd — Authorization header
  else if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, token missing" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.log("❌ Token verify failed:", error.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};