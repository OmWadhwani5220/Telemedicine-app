import React, { useState, useEffect } from "react";
import Layout                         from "./components/Layout";
import Dashboard                      from "./components/Dashboard";
import { AppointmentBooking }         from "./components/AppointmentBooking";
import { MedicalRecords }             from "./components/MedicalRecords";
import { RecordDetails }              from "./components/RecordDetails";
import { Prescriptions }              from "./components/Prescriptions";
import { Messages }                   from "./components/Messages";
import { SymptomChecker }             from "./components/SymptomChecker";
import { VideoConsultation }          from "./components/VideoConsultation";
import { Settings }                   from "./components/Settings";
import { getAuthProfile, logoutUser } from "./services/api";
import { ShieldOff, Heart }           from "lucide-react";

/* ── Unauthorized wall shown when no token ─────────────────────────── */
function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-12 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldOff className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
        <p className="text-gray-500 mb-8 text-sm leading-relaxed">
          You must be logged in to access the Patient Portal. Please sign in to continue.
        </p>
        <a
          href="http://localhost:5173/login"
          className="inline-flex items-center justify-center gap-2 w-full bg-emerald-500 hover:bg-emerald-600
            text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200"
        >
          <Heart className="w-5 h-5" />
          Go to Login
        </a>
      </div>
    </div>
  );
}

/* ── Full-screen loading spinner ───────────────────────────────────── */
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-14 h-14 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-emerald-600 font-medium text-sm tracking-wide">Loading your dashboard…</p>
      </div>
    </div>
  );
}

/* ── Main App ──────────────────────────────────────────────────────── */
export default function App() {
  const [currentScreen, setCurrentScreen] = useState("dashboard");
  const [screenData,    setScreenData]    = useState(null);
  const [patientName,   setPatientName]   = useState("");
  const [authStatus,    setAuthStatus]    = useState("checking"); // checking | ok | denied

  useEffect(() => {
    const token     = localStorage.getItem("token");
    const savedName = localStorage.getItem("name");

    /* No token at all → show wall immediately */
    if (!token) {
      setAuthStatus("denied");
      return;
    }

    /* Token exists – show UI right away with saved name */
    setPatientName(decodeURIComponent(savedName || "Patient"));
    setAuthStatus("ok");

    /* Background verify – only kick out on real 401 */
    getAuthProfile().then((data) => {
      if (!data) return;
      const name = data?.user?.name || savedName || "Patient";
      setPatientName(name);
      localStorage.setItem("name", name);
    }).catch(() => {/* network error – stay logged in */});
  }, []);

  const navigateTo = (screen, data = null) => {
    setCurrentScreen(screen);
    setScreenData(data);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLogout = async () => {
    await logoutUser();
    setAuthStatus("denied");
  };

  const handleNameUpdate = (name) => {
    setPatientName(name);
    localStorage.setItem("name", name);
  };

  if (authStatus === "checking") return <LoadingScreen />;
  if (authStatus === "denied")   return <UnauthorizedPage />;

  const renderScreen = () => {
    switch (currentScreen) {
      case "dashboard":
        return <Dashboard patientName={patientName} navigateTo={navigateTo} />;
      case "symptoms":
        return <SymptomChecker navigateTo={navigateTo} />;
      case "appointments":
        return <AppointmentBooking navigateTo={navigateTo} />;
      case "video":
        return <VideoConsultation navigateTo={navigateTo} />;
      case "records":
        return <MedicalRecords navigateTo={navigateTo} />;
      case "recordDetails":
        return <RecordDetails record={screenData?.selectedRecord} navigateTo={navigateTo} />;
      case "prescriptions":
        return <Prescriptions navigateTo={navigateTo} />;
      case "messages":
        return <Messages navigateTo={navigateTo} />;
      case "settings":
        return (
          <Settings
            navigateTo={navigateTo}
            patientName={patientName}
            onNameUpdate={handleNameUpdate}
            onLogout={handleLogout}
          />
        );
      default:
        return <Dashboard patientName={patientName} navigateTo={navigateTo} />;
    }
  };

  return (
    <Layout currentScreen={currentScreen} navigateTo={navigateTo} patientName={patientName} onLogout={handleLogout}>
      {renderScreen()}
    </Layout>
  );
}