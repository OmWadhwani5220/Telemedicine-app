import React, { useState, useEffect } from "react";
import {
  Home, Activity, Calendar, Video,
  FileText, FileCheck,
  Settings, LogOut, Heart, ChevronRight,
  Bell, Search, AlertCircle, User,
} from "lucide-react";

// Brand colors matching #0d9286
const B = "#0d9286";
const B_GLOW = "rgba(13,146,134,0.3)";
const B_LIGHT = "rgba(13,146,134,0.12)";

const NAV_ITEMS = [
  { id:"dashboard",     label:"Dashboard",          icon:Home          },
  { id:"symptoms",      label:"Symptom Checker",    icon:Activity      },
  { id:"appointments",  label:"Book Appointment",   icon:Calendar      },
  { id:"video",         label:"Video Consultation", icon:Video         },
  { id:"records",       label:"Medical Records",    icon:FileText      },
  { id:"prescriptions", label:"Prescriptions",      icon:FileCheck     },
  { id:"settings",      label:"Settings",           icon:Settings      },
];

const PROTECTED = ["appointments","symptoms","video","records","prescriptions"];

export default function Layout({
  children,
  currentScreen,
  navigateTo,
  patientName,
  onLogout,
  profileComplete,
  profileChecked,
}) {
  const [expanded, setExpanded] = useState(false);

  const safeName  = patientName || "Patient";
  const initials  = safeName.split(" ").map(w => w[0]).slice(0,2).join("").toUpperCase() || "P";
  const firstName = safeName.split(" ")[0] || "Patient";

  const isActive = id =>
    currentScreen === id || (currentScreen === "recordDetails" && id === "records");

  const handleNavigate = id => navigateTo(id);

  const handleLogout = async () => {
    if (onLogout) { onLogout(); return; }
    try { await fetch("http://localhost:5000/api/auth/logout", { method:"POST", credentials:"include" }); } catch {}
    localStorage.clear();
    window.location.href = "http://localhost:5173/login";
  };

  const SIDEBAR_W = expanded ? 240 : 64;

  return (
    <div style={{ display:"flex", height:"100vh", overflow:"hidden", fontFamily:"'Inter','Plus Jakarta Sans',system-ui,sans-serif", background:"#f1f5f9" }}>

      {/* ── SIDEBAR ──────────────────────────────────────────────────────── */}
      <div style={{
        width: SIDEBAR_W,
        height: "100vh",
        flexShrink: 0,
        background: "#0f172a",
        borderRight: `2px solid ${B}`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        transition: "width 0.3s cubic-bezier(0.4,0,0.2,1)",
        overflow: "hidden",
        position: "relative",
        boxShadow: expanded ? "2px 0 20px rgba(0,0,0,0.2)" : "none",
        zIndex: 30,
      }}>

        {/* Toggle chevron */}
        <div style={{ display:"flex", justifyContent:"flex-end", padding:"16px 14px 8px", flexShrink:0 }}>
          <button
            onClick={() => setExpanded(v => !v)}
            title={expanded ? "Collapse" : "Expand"}
            style={{
              background:"transparent", border:"none", cursor:"pointer",
              color: B,
              display:"flex", alignItems:"center", justifyContent:"center",
              transform: expanded ? "rotate(180deg)" : "none",
              transition:"transform 0.3s",
            }}
          >
            <ChevronRight size={22} strokeWidth={2.5} />
          </button>
        </div>

        {/* Brand (expanded) */}
        {expanded && (
          <div style={{ padding:"4px 18px 16px", borderBottom:"1px solid rgba(255,255,255,0.06)", flexShrink:0 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:36, height:36, background:`linear-gradient(135deg,${B},${B}cc)`, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:`0 4px 14px ${B_GLOW}`, flexShrink:0 }}>
                <Heart size={17} color="white" fill="white" />
              </div>
              <div>
                <p style={{ color:"white", fontSize:15, fontWeight:800, letterSpacing:"-0.3px", margin:0, lineHeight:1.2 }}>Telemed</p>
                <p style={{ color:"rgba(255,255,255,0.3)", fontSize:10, margin:0 }}>Patient Portal</p>
              </div>
            </div>
          </div>
        )}

        {/* Logo icon (collapsed) */}
        {!expanded && (
          <div style={{ display:"flex", justifyContent:"center", padding:"4px 0 16px", borderBottom:"1px solid rgba(255,255,255,0.06)", flexShrink:0 }}>
            <div style={{ width:36, height:36, background:`linear-gradient(135deg,${B},${B}cc)`, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:`0 4px 14px ${B_GLOW}` }}>
              <Heart size={17} color="white" fill="white" />
            </div>
          </div>
        )}

        {/* Profile incomplete warning */}
        {expanded && profileChecked && !profileComplete && (
          <div
            onClick={() => handleNavigate("settings")}
            style={{ margin:"10px 10px 0", padding:"10px 12px", background:"rgba(245,158,11,0.1)", border:"1px solid rgba(245,158,11,0.2)", borderRadius:10, cursor:"pointer", display:"flex", alignItems:"flex-start", gap:8, flexShrink:0 }}
          >
            <AlertCircle size={13} color="#F59E0B" style={{ flexShrink:0, marginTop:1 }} />
            <div>
              <p style={{ color:"#FCD34D", fontSize:11, fontWeight:600, margin:0 }}>Profile Incomplete</p>
              <p style={{ color:"rgba(252,211,77,0.6)", fontSize:10, margin:0, marginTop:1 }}>Tap to complete profile</p>
            </div>
          </div>
        )}

        {/* NAV */}
        <nav style={{ flex:1, padding:"12px 8px", overflowY:"auto", overflowX:"hidden" }}>
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const active = isActive(id);
            const locked = profileChecked && !profileComplete && PROTECTED.includes(id);
            return (
              <button
                key={id}
                onClick={() => handleNavigate(id)}
                title={!expanded ? (locked ? `${label} (complete profile to unlock)` : label) : undefined}
                style={{
                  display:"flex",
                  alignItems:"center",
                  gap: expanded ? 12 : 0,
                  justifyContent: expanded ? "flex-start" : "center",
                  width:"100%",
                  padding: expanded ? "10px 12px" : "10px",
                  marginBottom:4,
                  borderRadius:12,
                  border:"none",
                  cursor: locked ? "default" : "pointer",
                  textAlign:"left",
                  fontSize:13,
                  fontWeight: active ? 600 : 400,
                  background: active ? B_LIGHT : "transparent",
                  color: active ? B : locked ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.5)",
                  transition:"all 0.15s",
                  position:"relative",
                  fontFamily:"inherit",
                  whiteSpace:"nowrap",
                  overflow:"hidden",
                }}
                onMouseEnter={e => {
                  if (!active && !locked) {
                    e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                    e.currentTarget.style.color = "rgba(255,255,255,0.85)";
                  }
                }}
                onMouseLeave={e => {
                  if (!active && !locked) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "rgba(255,255,255,0.5)";
                  }
                }}
              >
                {/* Active indicator bar */}
                {active && expanded && (
                  <span style={{ position:"absolute", left:0, top:"50%", transform:"translateY(-50%)", width:3, height:22, background:B, borderRadius:"0 4px 4px 0" }} />
                )}
                <div style={{
                  width:34, height:34, borderRadius:9, flexShrink:0,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  background: active ? `${B}22` : "rgba(255,255,255,0.04)",
                }}>
                  <Icon size={17} />
                </div>
                {expanded && <span style={{ flex:1, overflow:"hidden", textOverflow:"ellipsis" }}>{label}</span>}
                {expanded && locked && <span style={{ fontSize:10, opacity:0.4 }}>🔒</span>}
              </button>
            );
          })}
        </nav>

        {/* BOTTOM */}
        <div style={{ padding:"10px 8px 14px", borderTop:"1px solid rgba(255,255,255,0.06)", flexShrink:0 }}>
          {/* Logout */}
          <button
            onClick={handleLogout}
            title={!expanded ? "Logout" : undefined}
            style={{
              display:"flex", alignItems:"center",
              gap: expanded ? 12 : 0,
              justifyContent: expanded ? "flex-start" : "center",
              width:"100%", padding: expanded ? "9px 12px" : "9px",
              borderRadius:12, border:"none", cursor:"pointer",
              background:"transparent", color:"rgba(255,255,255,0.35)",
              fontSize:13, fontWeight:400, transition:"all 0.15s",
              marginBottom:8, fontFamily:"inherit", whiteSpace:"nowrap",
            }}
            onMouseEnter={e => { e.currentTarget.style.background="rgba(239,68,68,0.1)"; e.currentTarget.style.color="#fca5a5"; }}
            onMouseLeave={e => { e.currentTarget.style.background="transparent"; e.currentTarget.style.color="rgba(255,255,255,0.35)"; }}
          >
            <div style={{ width:34, height:34, borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(255,255,255,0.04)", flexShrink:0 }}>
              <LogOut size={16} />
            </div>
            {expanded && "Logout"}
          </button>

          {/* Avatar chip */}
          <div style={{
            display:"flex", alignItems:"center",
            gap: expanded ? 10 : 0,
            justifyContent: expanded ? "flex-start" : "center",
            background: expanded ? B : B_LIGHT,
            borderRadius:12, padding: expanded ? "9px 12px" : "9px",
            transition:"all 0.3s",
          }}>
            <div style={{ width:34, height:34, borderRadius:"50%", background:"rgba(255,255,255,0.25)", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:12, flexShrink:0 }}>
              {initials}
            </div>
            {expanded && (
              <div style={{ overflow:"hidden" }}>
                <p style={{ margin:0, fontSize:12.5, fontWeight:600, color:"#fff", lineHeight:1.3, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{safeName}</p>
                <p style={{ margin:0, fontSize:10, color:"rgba(255,255,255,0.55)" }}>Patient</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── MAIN AREA ──────────────────────────────────────────────────────── */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", background:"#f1f5f9", minWidth:0 }}>

        {/* Top Header */}
        <div style={{
          background:"#fff",
          borderBottom:"1px solid #e2e8f0",
          padding:"0 24px",
          height:62,
          display:"flex", alignItems:"center", justifyContent:"space-between",
          flexShrink:0,
          boxShadow:"0 1px 4px rgba(0,0,0,0.04)",
          position:"sticky", top:0, zIndex:20,
        }}>
          {/* Left */}
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ display:"flex", flexDirection:"column" }}>
              
             
            </div>
          </div>

          {/* Right */}
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            {/* Search */}
            <div style={{ position:"relative" }}>
              <Search size={13} color="#94a3b8" style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }} />
              <input
                placeholder="Search…"
                style={{ paddingLeft:30, paddingRight:12, height:36, width:180, border:"1.5px solid #e2e8f0", borderRadius:10, fontSize:13, color:"#0f172a", background:"#f8fafc", outline:"none", fontFamily:"inherit", transition:"border-color 0.2s" }}
                onFocus={e => { e.target.style.borderColor=B; e.target.style.background="#fff"; }}
                onBlur={e  => { e.target.style.borderColor="#e2e8f0"; e.target.style.background="#f8fafc"; }}
              />
            </div>

            {/* Profile incomplete dot */}
            {profileChecked && !profileComplete && (
              <button
                onClick={() => handleNavigate("settings")}
                title="Complete your profile"
                style={{ width:36, height:36, borderRadius:9, border:"1.5px solid rgba(245,158,11,0.4)", background:"rgba(245,158,11,0.07)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}
              >
                <AlertCircle size={15} color="#f59e0b" />
              </button>
            )}

            {/* Bell */}
            <button style={{ width:36, height:36, borderRadius:9, border:"1.5px solid #e2e8f0", background:"white", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", position:"relative" }}>
              <Bell size={15} color="#64748b" />
              <span style={{ position:"absolute", top:8, right:8, width:7, height:7, background:"#ef4444", borderRadius:"50%", border:"2px solid white" }} />
            </button>

            {/* Avatar */}
            <div style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer" }}>
              <div style={{ width:36, height:36, borderRadius:9, background:`linear-gradient(135deg,${B},${B}cc)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:"white", boxShadow:`0 2px 8px ${B_GLOW}` }}>
                {initials}
              </div>
              <div style={{ display:"flex", flexDirection:"column" }}>
                <span style={{ fontSize:12, fontWeight:600, color:"#0f172a", lineHeight:1.2 }}>{firstName}</span>
                <span style={{ fontSize:10, color:"#94a3b8" }}>Patient</span>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <div style={{ flex:1, overflowY:"auto" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

const PAGE_TITLES = {
  dashboard:    "Dashboard",
  symptoms:     "Symptom Checker",
  appointments: "Book Appointment",
  video:        "Video Consultation",
  records:      "Medical Records",
  recordDetails:"Record Details",
  prescriptions:"Prescriptions",
  settings:     "Settings",
};