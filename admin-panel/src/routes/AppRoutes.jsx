import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import AdminRoutes from "./AdminRoutes";

const ExternalRedirect = ({ to }) => {
  useEffect(() => { window.location.href = to; }, [to]);
  return null;
};

const AdminRoute = () => {
  const token = localStorage.getItem("token");
  const role  = localStorage.getItem("role");

  console.log("🔐 AdminRoute → token:", token ? "exists" : "MISSING");
  console.log("🔐 AdminRoute → role:", role);

  if (token && role === "admin") return <Outlet />;

  return <ExternalRedirect to="http://localhost:5173/login" />;
};

const AppRoutes = () => {
  const [ready, setReady] = useState(false);
  const [role,  setRole]  = useState("");
  const [token, setToken] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      const t = localStorage.getItem("token");
      const r = localStorage.getItem("role");
      console.log("📦 AppRoutes ready → token:", t ? "exists ✅" : "MISSING ❌");
      console.log("📦 AppRoutes ready → role:", r);
      setToken(t || "");
      setRole(r  || "");
      setReady(true);
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  if (!ready) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex",
        alignItems: "center", justifyContent: "center",
        background: "#f9fafb",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 40, height: 40,
            border: "4px solid #6366f1",
            borderTopColor: "transparent",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
            margin: "0 auto 12px",
          }} />
          <p style={{ color: "#9ca3af", fontSize: 14 }}>Loading admin panel...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          token && role === "admin"
            ? <Navigate to="/admin/dashboard" replace />
            : <ExternalRedirect to="http://localhost:5173/login" />
        }
      />
      <Route element={<AdminRoute />}>
        <Route path="/admin/*" element={<AdminRoutes />} />
      </Route>
      <Route
        path="*"
        element={<ExternalRedirect to="http://localhost:5173/login" />}
      />
    </Routes>
  );
};

export default AppRoutes;