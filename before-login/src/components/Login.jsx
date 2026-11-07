
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

// Cookie helper
function setCookie(name, value, days = 1) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();

  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax; Secure`;
}

// Delete cookie
export function deleteCookie(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;

  const panelURLs = {
    patient: import.meta.env.VITE_PATIENT_PANEL_URL,
    doctor: import.meta.env.VITE_DOCTOR_PANEL_URL,
    admin: import.meta.env.VITE_ADMIN_PANEL_URL
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      if (!API_URL) {
        throw new Error("Backend API URL is not configured.");
      }

      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }

      if (!data.token || !data.user || !data.user.role) {
        setError("Invalid login response from server.");
        return;
      }

      const role = data.user.role;
      const panelURL = panelURLs[role];

      if (!panelURL) {
        setError("Panel URL is not configured for this account.");
        return;
      }

      // Save login information
      setCookie("token", data.token, 1);

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", role);
      localStorage.setItem("name", data.user.name || "");

      // Redirect to the appropriate deployed panel
      const redirectURL = new URL(panelURL);

      redirectURL.searchParams.set("token", data.token);
      redirectURL.searchParams.set("name", data.user.name || "");
      redirectURL.searchParams.set("role", role);

      console.log("Redirecting to:", redirectURL.toString());

      window.location.replace(redirectURL.toString());

    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tm-auth-wrapper">
      <div className="tm-auth-card">

        <div className="tm-auth-header">
          <h2>Telemedicine Portal</h2>
          <p>Login to continue your journey</p>
        </div>

        <div className="tm-auth-steps">
          <div className="step active">
            <span>1</span>
            <p>Login</p>
          </div>

          <div className="line" />

          <div className="step">
            <span>2</span>
            <p>Dashboard</p>
          </div>
        </div>

        <form className="tm-auth-form" onSubmit={handleSubmit}>
          {error && (
            <div className="tm-error">{error}</div>
          )}

          <div className="tm-form-group">
            <label>Email Address</label>

            <input
              type="email"
              name="email"
              placeholder="your.email@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="tm-form-group">
            <label>Password</label>

            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            className="tm-primary-btn"
            type="submit"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="tm-auth-footer">
          Don't have an account?{" "}
          <span onClick={() => navigate("/signup")}>
            Sign Up
          </span>
        </div>

      </div>
    </div>
  );
}
