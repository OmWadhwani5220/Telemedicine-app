// user-panel/src/App.jsx
// FIXES:
//  ✅ Added missing screens: symptoms, records, recordDetails, prescriptions, messages
//  ✅ Computes profileComplete from patient profile and passes it to Layout + Dashboard
//  ✅ Protected nav items only locked when profile truly incomplete

import React, { useState, useEffect, Suspense } from "react";
import Layout                  from "./components/Layout";
import Dashboard               from "./components/Dashboard";
import { AppointmentBooking }  from "./components/AppointmentBooking";
import { VideoConsultation }   from "./components/VideoConsultation";
import { Settings }            from "./components/Settings";
import { SymptomChecker }      from "./components/SymptomChecker";
import { MedicalRecords }      from "./components/MedicalRecords";
import { Prescriptions }       from "./components/Prescriptions";
import { Messages }            from "./components/Messages";

// RecordDetails may not exist yet — lazy with fallback
let RecordDetails = null;
try {
  RecordDetails = React.lazy(() =>
    import("./components/RecordDetails").then(m => ({ default: m.RecordDetails || m.default }))
  );
} catch {}

const Spinner = () => (
  <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", minHeight:"60vh" }}>
    <div style={{ width:36, height:36, border:"3px solid #10B981", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

class Boundary extends React.Component {
  state = { err: false };
  static getDerivedStateFromError() { return { err: true }; }
  render() {
    if (this.state.err) return (
      <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"80vh", gap:16 }}>
        <div style={{ fontSize:40 }}>🚧</div>
        <h2 style={{ color:"#0F172A", fontWeight:700, margin:0 }}>Coming Soon</h2>
        <p style={{ color:"#94A3B8", fontSize:14, margin:0 }}>This feature is under construction</p>
      </div>
    );
    return this.props.children;
  }
}

const LOGIN_URL = "http://localhost:5173/login";
const BACKEND   = "http://localhost:5000";

// Profile is "complete" if name, dob, gender, and bloodGroup are filled
const isProfileComplete = (patient) => {
  if (!patient) return false;
  return !!(patient.name && patient.dob && patient.gender && patient.bloodGroup);
};

export default function App() {
  const [currentScreen,  setCurrentScreen]  = useState("dashboard");
  const [patientName,    setPatientName]    = useState("Patient");
  const [ready,          setReady]          = useState(false);
  const [profileComplete,setProfileComplete]= useState(null); // null = not checked yet
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      const token     = localStorage.getItem("token");
      const savedName = localStorage.getItem("name");

      if (!token) { window.location.href = LOGIN_URL; return; }

      setPatientName(decodeURIComponent(savedName || "Patient"));
      setReady(true);

      try {
        // Fetch profile to determine completeness
        const [authRes, profileRes] = await Promise.all([
          fetch(`${BACKEND}/api/auth/profile`, {
            headers: { Authorization: `Bearer ${token}`, "Content-Type":"application/json" },
            credentials: "include",
          }),
          fetch(`${BACKEND}/api/patient/profile`, {
            headers: { Authorization: `Bearer ${token}` },
            credentials: "include",
          }),
        ]);

        if (authRes.status === 401) {
          localStorage.clear();
          window.location.href = LOGIN_URL;
          return;
        }

        if (authRes.ok) {
          const authData = await authRes.json();
          const name = authData?.user?.name || authData?.name || savedName || "Patient";
          setPatientName(name);
          localStorage.setItem("name", name);
        }

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setProfileComplete(isProfileComplete(profileData?.patient));
        } else {
          setProfileComplete(false);
        }
      } catch {
        // Network error — keep user logged in, assume profile incomplete for safety
        setProfileComplete(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, []);

  const handleLogout = async () => {
    try { await fetch(`${BACKEND}/api/auth/logout`, { method:"POST", credentials:"include" }); } catch {}
    localStorage.clear();
    window.location.href = LOGIN_URL;
  };

  const handleNavigate = (screen, data = null) => {
    if (data?.selectedRecord) setSelectedRecord(data.selectedRecord);
    setCurrentScreen(screen);
    window.scrollTo(0, 0);
  };

  if (!ready) return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:"#0F172A", gap:16 }}>
      <div style={{ width:44, height:44, border:"4px solid #10B981", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
      <p style={{ color:"#94a3b8", fontSize:14, margin:0 }}>Loading…</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const p = { navigateTo: handleNavigate, patientName, profileComplete };

  const wrap = (Component, extra = {}) => (
    <Boundary>
      <Suspense fallback={<Spinner />}>
        <Component {...p} {...extra} />
      </Suspense>
    </Boundary>
  );

  const renderScreen = () => {
    switch (currentScreen) {
      case "dashboard":    return <Dashboard {...p} />;
      case "symptoms":     return <SymptomChecker     navigateTo={handleNavigate} />;
      case "appointments": return <AppointmentBooking navigateTo={handleNavigate} />;
      case "video":        return <VideoConsultation  navigateTo={handleNavigate} />;
      case "records":      return <MedicalRecords     navigateTo={handleNavigate} />;
      case "recordDetails":
        return RecordDetails
          ? wrap(RecordDetails, { record: selectedRecord })
          : <MedicalRecords navigateTo={handleNavigate} />;
      case "prescriptions":return <Prescriptions      navigateTo={handleNavigate} />;
      case "messages":     return <Messages           navigateTo={handleNavigate} />;
      case "settings":     return <Settings navigateTo={handleNavigate} onLogout={handleLogout} />;
      default:             return <Dashboard {...p} />;
    }
  };

  return (
    <Layout
      currentScreen={currentScreen}
      navigateTo={handleNavigate}
      patientName={patientName}
      onLogout={handleLogout}
      profileComplete={profileComplete}
      profileChecked={profileComplete !== null}
    >
      {renderScreen()}
    </Layout>
  );
}