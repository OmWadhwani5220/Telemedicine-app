import "dotenv/config";
import Groq from "groq-sdk";

console.log(
  "GROQ_API_KEY:",
  process.env.GROQ_API_KEY ? "LOADED ✅" : "NOT LOADED ❌"
);

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export default groq;