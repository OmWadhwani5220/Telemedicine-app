import React, { useState } from "react";
import {
  Home,
  Activity,
  Calendar,
  Video,
  FileText,
  FileCheck,
  MessageSquare,
  Settings as SettingsIcon,
  LogOut,
  Heart,
  Menu,
  X,
  User,
} from "lucide-react";

const menuItems = [
  { id: "dashboard", label: "Dashboard",          icon: Home          },
  { id: "symptoms",  label: "Symptom Checker",    icon: Activity      },
  { id: "appointments", label: "Book Appointment",icon: Calendar      },
  { id: "video",     label: "Video Consultation", icon: Video         },
  { id: "records",   label: "Medical Records",    icon: FileText      },
  { id: "prescriptions", label: "Prescriptions",  icon: FileCheck     },
  { id: "messages",  label: "Messages",           icon: MessageSquare },
  { id: "settings",  label: "Settings",           icon: SettingsIcon  },
];

export default function Layout({ children, currentScreen, navigateTo, patientName }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:5000/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout error:", err);
    }
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "http://localhost:5173/login";
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* ── Mobile toggle button ── */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-emerald-500 text-white rounded-lg shadow-lg"
      >
        {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* ── Mobile overlay ── */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ══════════════════════════════════════
          SIDEBAR
      ══════════════════════════════════════ */}
      <aside
        className={`w-64 bg-white min-h-screen flex flex-col fixed left-0 top-0 bottom-0
          border-r border-gray-200 z-40 transition-transform duration-300
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Logo */}
        <div className="p-5 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow">
              <Heart className="w-6 h-6 text-white" fill="currentColor" />
            </div>
            <div>
              <h2 className="text-gray-800 font-semibold text-sm">MediCare</h2>
              <p className="text-gray-400 text-xs">Patient Portal</p>
            </div>
          </div>
        </div>

        {/* Patient name in sidebar */}
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-gray-800 font-medium text-sm">
                {patientName || "Loading..."}
              </p>
              <p className="text-gray-400 text-xs">Patient</p>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map(({ id, label, icon: Icon }) => {
            const isActive = currentScreen === id ||
              (currentScreen === "recordDetails" && id === "records");
            return (
              <button
                key={id}
                onClick={() => { navigateTo(id); setMobileOpen(false); }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg
                  transition-all text-sm
                  ${isActive
                    ? "bg-emerald-50 text-emerald-600 border-l-4 border-emerald-500 font-medium"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                  }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-gray-500
              hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors text-sm"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ── Main content area ── */}
      <div className="flex-1 lg:ml-64">
        {children}
      </div>
    </div>
  );
}