import React, { useState, useEffect, Suspense, lazy } from "react";
import Layout    from "./components/Layout";
import Dashboard from "./components/Dashboard";

// ✅ Lazy load all screens
const SymptomChecker     = lazy(() => import("./components/SymptomChecker"));
const AppointmentBooking = lazy(() => import("./components/AppointmentBooking"));
const VideoConsultation  = lazy(() => import("./components/VideoConsultation"));
const MedicalRecords     = lazy(() => import("./components/MedicalRecords"));
const RecordDetails      = lazy(() => import("./components/RecordDetails"));
const Prescriptions      = lazy(() => import("./components/Prescriptions"));
const Messages           = lazy(() => import("./components/Messages"));
const Settings           = lazy(() => import("./components/Settings"));

// ✅ Loading spinner for lazy screens
const ScreenLoader = () => (
  <div style={{
    flex:1, display:"flex", alignItems:"center",
    justifyContent:"center", minHeight:"60vh",
  }}>
    <div style={{
      width:36, height:36,
      border:"3px solid #10B981",
      borderTopColor:"transparent",
      borderRadius:"50%",
      animation:"spin 0.8s linear infinite",
    }} />
    <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
  </div>
);

// ✅ Error boundary — shows "Coming Soon" if component crashes
class ScreenErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError:false }; }
  static getDerivedStateFromError() { return { hasError:true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          flex:1, display:"flex", flexDirection:"column",
          alignItems:"center", justifyContent:"center",
          minHeight:"80vh", gap:16,
        }}>
          <div style={{
            width:72, height:72, borderRadius:20,
            background:"linear-gradient(135deg,#10B981,#059669)",
            display:"flex", alignItems:"center",
            justifyContent:"center", fontSize:32,
            boxShadow:"0 8px 24px rgba(16,185,129,0.3)",
          }}>🚧</div>
          <h2 style={{ color:"#0F172A", fontSize:22, fontWeight:700, margin:0 }}>
            Coming Soon
          </h2>
          <p style={{ color:"#94A3B8", fontSize:14, margin:0 }}>
            This page is under construction
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

// ✅ Login URL — port 5173
const LOGIN_URL = "http://localhost:5173/login";

export default function App() {
  const [currentScreen,  setCurrentScreen]  = useState("dashboard");
  const [patientName,    setPatientName]    = useState("Patient");
  const [ready,          setReady]          = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const token     = localStorage.getItem("token");
      const savedName = localStorage.getItem("name");
      const role      = localStorage.getItem("role");

      console.log("📦 Token:", token ? "EXISTS ✅" : "MISSING ❌");
      console.log("📦 Name:", savedName);
      console.log("📦 Role:", role);

      // ❌ No token → go to login
      if (!token) {
        window.location.href = LOGIN_URL;
        return;
      }

      // ✅ Show app immediately with saved name
      setPatientName(decodeURIComponent(savedName || "Patient"));
      setReady(true);

      // ✅ Background verify with backend
      fetch("http://localhost:5000/api/auth/profile", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      })
        .then((res) => {
          if (res.status === 401) {
            localStorage.clear();
            window.location.href = LOGIN_URL;
            return null;
          }
          if (!res.ok) return null;
          return res.json();
        })
        .then((data) => {
          if (!data) return;
          const name = data?.user?.name || data?.name || savedName || "Patient";
          setPatientName(name);
          localStorage.setItem("name", name);
        })
        .catch(() => {
          console.warn("⚠️ Network error — keeping user logged in");
        });

    }, 150);

    return () => clearTimeout(timer);
  }, []);

  // ✅ Logout handler
  const handleLogout = async () => {
    try {
      await fetch("http://localhost:5000/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (e) { console.warn(e); }
    localStorage.clear();
    window.location.href = LOGIN_URL;
  };

  // ✅ Navigation handler
  const handleNavigate = (screen, data = null) => {
    console.log("🧭 Navigating to:", screen);
    if (data?.selectedRecord) setSelectedRecord(data.selectedRecord);
    setCurrentScreen(screen);
    window.scrollTo(0, 0);
  };

  // ── App loading spinner ──
  if (!ready) {
    return (
      <div style={{
        minHeight:"100vh", display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center", background:"#0F172A",
      }}>
        <div style={{
          width:44, height:44,
          border:"4px solid #10B981",
          borderTopColor:"transparent",
          borderRadius:"50%",
          animation:"spin 0.8s linear infinite",
          marginBottom:16,
        }} />
        <p style={{ color:"#94a3b8", fontSize:14, margin:0 }}>Loading...</p>
        <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ── Screen renderer ──
  const renderScreen = () => {
    const commonProps = {
      navigateTo: handleNavigate,
      patientName,
    };

    const wrapScreen = (Component, extraProps = {}) => (
      <ScreenErrorBoundary>
        <Suspense fallback={<ScreenLoader />}>
          <Component {...commonProps} {...extraProps} />
        </Suspense>
      </ScreenErrorBoundary>
    );

    switch (currentScreen) {
      case "dashboard":
        return <Dashboard {...commonProps} />;

      case "symptoms":
        return wrapScreen(SymptomChecker);

      case "appointments":
        return wrapScreen(AppointmentBooking);

      case "video":
        return wrapScreen(VideoConsultation);

      case "records":
        return wrapScreen(MedicalRecords);

      case "recordDetails":
        return wrapScreen(RecordDetails, { record: selectedRecord });

      case "prescriptions":
        return wrapScreen(Prescriptions);

      case "messages":
        return wrapScreen(Messages);

      case "settings":
        return wrapScreen(Settings, { onLogout: handleLogout });

      default:
        return <Dashboard {...commonProps} />;
    }
  };

  return (
    <Layout
      currentScreen={currentScreen}
      navigateTo={handleNavigate}
      patientName={patientName}
      onLogout={handleLogout}
    >
      {renderScreen()}
    </Layout>
  );
}