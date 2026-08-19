// backend/utils/encryption.js
// AES-256-GCM symmetric encryption for prescription data
// Add to backend/.env:  PRESCRIPTION_KEY=<run this once: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">

import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";

function getKey() {
  const key = process.env.PRESCRIPTION_KEY;
  if (!key || key.length !== 64) {
    // Fallback deterministic key for dev — CHANGE IN PRODUCTION
    console.warn("⚠ PRESCRIPTION_KEY missing or wrong length — using dev fallback. Set a 64-char hex key in .env");
    return Buffer.from("0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef", "hex");
  }
  return Buffer.from(key, "hex");
}

/**
 * Encrypt any string/JSON → returns { encryptedData, iv, authTag }
 * All values are hex strings safe to store in MongoDB.
 */
export function encrypt(plaintext) {
  const iv     = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);

  let encrypted = cipher.update(
    typeof plaintext === "object" ? JSON.stringify(plaintext) : plaintext,
    "utf8",
    "hex"
  );
  encrypted += cipher.final("hex");

  return {
    encryptedData: encrypted,
    iv:            iv.toString("hex"),
    authTag:       cipher.getAuthTag().toString("hex"),
  };
}

/**
 * Decrypt { encryptedData, iv, authTag } → original plaintext
 */
export function decrypt({ encryptedData, iv, authTag }) {
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    getKey(),
    Buffer.from(iv, "hex")
  );
  decipher.setAuthTag(Buffer.from(authTag, "hex"));

  let decrypted = decipher.update(encryptedData, "hex", "utf8");
  decrypted    += decipher.final("utf8");

  try { return JSON.parse(decrypted); } catch { return decrypted; }
}