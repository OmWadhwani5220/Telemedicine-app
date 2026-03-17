import React, { useState, useEffect } from "react";
import Layout    from "./components/Layout";
import Dashboard from "./components/Dashboard";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState("dashboard");
  const [patientName,   setPatientName]   = useState("");
  const [authChecked,   setAuthChecked]   = useState(false);

  useEffect(() => {
    const token     = localStorage.getItem("token");
    const savedName = localStorage.getItem("name");

    console.log("📦 Token:", token);
    console.log("📦 Name:", savedName);

    // ❌ Truly no token → go to login
    if (!token) {
      window.location.href = "http://localhost:5173/login";
      return;
    }

    // ✅ Token exists → show app immediately, no waiting
    setPatientName(decodeURIComponent(savedName || "Patient"));
    setAuthChecked(true);

    // ✅ Background verify — ONLY redirect if 401
    fetch("http://localhost:5000/api/auth/profile", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
      .then((res) => {
        console.log("📡 Profile status:", res.status);

        // ✅ Only redirect on 401 — true invalid token
        if (res.status === 401) {
          localStorage.clear();
          window.location.href = "http://localhost:5173/login";
          return null;
        }

        // ✅ Any other error (404, 500) — DON'T redirect, keep user in
        if (!res.ok) {
          console.warn("⚠️ Profile non-401 error:", res.status, "— staying logged in");
          return null;
        }

        return res.json();
      })
      .then((data) => {
        if (!data) return;
        const name = data?.user?.name || savedName || "Patient";
        setPatientName(name);
        localStorage.setItem("name", name);
      })
      .catch(() => {
        // ✅ Network error — backend might be slow, DON'T redirect
        console.warn("⚠️ Network error — keeping user logged in with saved name");
      });

  }, []);

  // Spinner while checking
  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-emerald-500
            border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case "dashboard": return <Dashboard patientName={patientName} />;
      default:          return <Dashboard patientName={patientName} />;
    }
  };

  return (
    <Layout
      currentScreen={currentScreen}
      navigateTo={setCurrentScreen}
      patientName={patientName}
    >
      {renderScreen()}
    </Layout>
  );
}