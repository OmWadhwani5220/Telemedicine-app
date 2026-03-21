import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

// ✅ Save token from URL BEFORE anything renders
const urlParams = new URLSearchParams(window.location.search);
const urlToken  = urlParams.get("token");
const urlName   = urlParams.get("name");
const urlRole   = urlParams.get("role");

if (urlToken) {
  localStorage.setItem("token", urlToken);
  localStorage.setItem("name",  decodeURIComponent(urlName || ""));
  localStorage.setItem("role",  urlRole || "admin");
  window.history.replaceState({}, document.title, "/");
  console.log("✅ Admin token saved:", urlToken);
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);