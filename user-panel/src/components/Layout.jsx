import React, { useState } from "react";
import {
  Home, Activity, Calendar, Video,
  FileText, FileCheck, MessageSquare,
  Settings, LogOut, Heart, Menu, X,
  Bell, Search, ChevronDown,
} from "lucide-react";

const NAV_ITEMS = [
  { id:"dashboard",     label:"Dashboard",          icon:Home          },
  { id:"symptoms",      label:"Symptom Checker",    icon:Activity      },
  { id:"appointments",  label:"Book Appointment",   icon:Calendar      },
  { id:"video",         label:"Video Consultation", icon:Video         },
  { id:"records",       label:"Medical Records",    icon:FileText      },
  { id:"prescriptions", label:"Prescriptions",      icon:FileCheck     },
  { id:"messages",      label:"Messages",           icon:MessageSquare },
  { id:"settings",      label:"Settings",           icon:Settings      },
];

// ✅ Uses File 2 prop names: currentScreen, navigateTo, patientName, + onLogout
export default function Layout({
  children,
  currentScreen,
  navigateTo,
  patientName,
  onLogout,
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const safeName  = patientName || "Patient";
  const initials  = safeName.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() || "P";
  const firstName = safeName.split(" ")[0] || "Patient";

  // ✅ File 2 navigation logic
  const isActive = id =>
    currentScreen === id ||
    (currentScreen === "recordDetails" && id === "records");

  const handleNavigate = (id) => {
    navigateTo(id);
    setMobileOpen(false);
  };

  // ✅ File 2 logout logic
  const handleLogout = async () => {
    if (onLogout) {
      onLogout();
      return;
    }
    try {
      await fetch("http://localhost:5000/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout error:", err);
    }
    localStorage.clear();
    window.location.href = "http://localhost:5175/login";
  };

  /* ── Nav Item ── */
  const NavItem = ({ id, label, icon: Icon }) => {
    const active = isActive(id);
    return (
      <button
        onClick={() => handleNavigate(id)}
        style={{
          display:"flex", alignItems:"center", gap:12,
          padding:"10px 14px", borderRadius:10, width:"100%",
          border:"none", cursor:"pointer", textAlign:"left",
          fontSize:13.5, fontWeight: active ? 600 : 400,
          background: active ? "rgba(16,185,129,0.15)" : "transparent",
          color: active ? "#10B981" : "rgba(255,255,255,0.5)",
          transition:"all 0.15s", marginBottom:2,
          position:"relative", letterSpacing:"0.01em",
        }}
        onMouseEnter={e => {
          if (!active) {
            e.currentTarget.style.background = "rgba(255,255,255,0.05)";
            e.currentTarget.style.color = "rgba(255,255,255,0.85)";
          }
        }}
        onMouseLeave={e => {
          if (!active) {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "rgba(255,255,255,0.5)";
          }
        }}
      >
        {/* Active left indicator */}
        {active && (
          <span style={{
            position:"absolute", left:0, top:"50%",
            transform:"translateY(-50%)",
            width:3, height:22, background:"#10B981",
            borderRadius:"0 4px 4px 0",
          }} />
        )}

        {/* Icon */}
        <div style={{
          width:32, height:32, borderRadius:8,
          display:"flex", alignItems:"center",
          justifyContent:"center", flexShrink:0,
          background: active
            ? "rgba(16,185,129,0.2)"
            : "rgba(255,255,255,0.04)",
        }}>
          <Icon size={16} />
        </div>

        <span>{label}</span>
      </button>
    );
  };

  /* ── Sidebar ── */
  const Sidebar = () => (
    <div style={{
      width:248, height:"100%",
      background:"#0F172A",
      display:"flex", flexDirection:"column",
      borderRight:"1px solid rgba(255,255,255,0.05)",
    }}>

      {/* Logo */}
      <div style={{
        padding:"20px 18px 16px",
        borderBottom:"1px solid rgba(255,255,255,0.06)",
        display:"flex", alignItems:"center", gap:12,
      }}>
        <div style={{
          width:38, height:38,
          background:"linear-gradient(135deg,#10B981,#059669)",
          borderRadius:11, display:"flex",
          alignItems:"center", justifyContent:"center",
          boxShadow:"0 4px 14px rgba(16,185,129,0.4)",
          flexShrink:0,
        }}>
          <Heart size={18} color="white" fill="white" />
        </div>
        <div>
          <p style={{
            color:"white", fontSize:16, fontWeight:800,
            letterSpacing:"-0.3px", margin:0, lineHeight:1.2,
          }}>Telemed</p>
          <p style={{
            color:"rgba(255,255,255,0.35)", fontSize:11,
            margin:0, marginTop:1,
          }}>Patient Portal</p>
        </div>
      </div>

      {/* Patient info */}
      <div style={{
        padding:"14px 18px",
        borderBottom:"1px solid rgba(255,255,255,0.05)",
        display:"flex", alignItems:"center", gap:12,
      }}>
        <div style={{
          width:38, height:38, borderRadius:10,
          background:"linear-gradient(135deg,#10B981,#059669)",
          display:"flex", alignItems:"center",
          justifyContent:"center", flexShrink:0,
          fontSize:13, fontWeight:700, color:"white",
          boxShadow:"0 2px 8px rgba(16,185,129,0.3)",
        }}>
          {initials}
        </div>
        <div>
          <p style={{
            color:"white", fontSize:13, fontWeight:600,
            margin:0, lineHeight:1.3,
          }}>{safeName}</p>
          <p style={{
            color:"rgba(255,255,255,0.35)", fontSize:11,
            margin:0, marginTop:1,
          }}>Patient</p>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex:1, padding:"14px 10px", overflowY:"auto" }}>
        <p style={{
          fontSize:10, fontWeight:700, letterSpacing:"1.2px",
          textTransform:"uppercase",
          color:"rgba(255,255,255,0.18)",
          padding:"0 8px", marginBottom:8, marginTop:4,
        }}>Navigation</p>
        {NAV_ITEMS.map(item => (
          <NavItem key={item.id} {...item} />
        ))}
      </nav>

      {/* Logout */}
      <div style={{
        padding:"12px 10px",
        borderTop:"1px solid rgba(255,255,255,0.06)",
      }}>
        <button
          onClick={handleLogout}
          style={{
            display:"flex", alignItems:"center", gap:12,
            padding:"10px 14px", borderRadius:10, width:"100%",
            border:"none", cursor:"pointer", textAlign:"left",
            fontSize:13.5, fontWeight:400, background:"transparent",
            color:"rgba(255,255,255,0.4)", transition:"all 0.15s",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "rgba(239,68,68,0.12)";
            e.currentTarget.style.color = "#FCA5A5";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "rgba(255,255,255,0.4)";
          }}
        >
          <div style={{
            width:32, height:32, borderRadius:8,
            display:"flex", alignItems:"center",
            justifyContent:"center",
            background:"rgba(255,255,255,0.04)",
          }}>
            <LogOut size={16} />
          </div>
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div style={{
      display:"flex", height:"100vh", overflow:"hidden",
      fontFamily:"'Inter','Plus Jakarta Sans',system-ui,sans-serif",
    }}>

      {/* Desktop sidebar — always visible */}
      <div style={{ flexShrink:0, height:"100vh" }}>
        <Sidebar />
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position:"fixed", inset:0,
            background:"rgba(0,0,0,0.65)",
            zIndex:40, backdropFilter:"blur(4px)",
          }}
        />
      )}

      {/* Mobile sidebar drawer */}
      <div style={{
        position:"fixed", top:0, left:0,
        bottom:0, zIndex:50, height:"100vh",
        transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
        transition:"transform 0.25s cubic-bezier(0.4,0,0.2,1)",
      }}>
        <Sidebar />
      </div>

      {/* Main area */}
      <div style={{
        flex:1, display:"flex", flexDirection:"column",
        overflow:"hidden", background:"#F1F5F9",
      }}>

        {/* Header */}
        <div style={{
          background:"white", borderBottom:"1px solid #E2E8F0",
          padding:"0 24px", height:62,
          display:"flex", alignItems:"center",
          justifyContent:"space-between",
          flexShrink:0, boxShadow:"0 1px 4px rgba(0,0,0,0.04)",
        }}>

          {/* Left */}
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{
                width:36, height:36, borderRadius:8,
                border:"1.5px solid #E2E8F0",
                background:"white", cursor:"pointer",
                display:"flex", alignItems:"center",
                justifyContent:"center",
              }}
            >
              {mobileOpen
                ? <X size={17} color="#64748B"/>
                : <Menu size={17} color="#64748B"/>
              }
            </button>
            <div>
              <p style={{
                fontSize:17, fontWeight:700,
                color:"#0F172A", margin:0, lineHeight:1.3,
              }}>
                Hello, {firstName} 👋
              </p>
              <p style={{
                fontSize:12, color:"#94A3B8",
                margin:0, marginTop:2,
              }}>
                Welcome to your health dashboard
              </p>
            </div>
          </div>

          {/* Right */}
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>

            {/* Search */}
            <div style={{ position:"relative", display:"flex" }}>
              <Search size={14} color="#94A3B8" style={{
                position:"absolute", left:11,
                top:"50%", transform:"translateY(-50%)",
                pointerEvents:"none",
              }} />
              <input
                placeholder="Search…"
                style={{
                  paddingLeft:32, paddingRight:14,
                  height:36, width:200,
                  border:"1.5px solid #E2E8F0",
                  borderRadius:9, fontSize:13,
                  color:"#0F172A", background:"#F8FAFC",
                  outline:"none", fontFamily:"inherit",
                }}
                onFocus={e => {
                  e.target.style.borderColor = "#10B981";
                  e.target.style.background = "white";
                }}
                onBlur={e => {
                  e.target.style.borderColor = "#E2E8F0";
                  e.target.style.background = "#F8FAFC";
                }}
              />
            </div>

            {/* Bell */}
            <button style={{
              width:36, height:36, borderRadius:9,
              border:"1.5px solid #E2E8F0",
              background:"white", cursor:"pointer",
              display:"flex", alignItems:"center",
              justifyContent:"center", position:"relative",
            }}>
              <Bell size={16} color="#64748B" />
              <span style={{
                position:"absolute", top:7, right:7,
                width:7, height:7, background:"#EF4444",
                borderRadius:"50%", border:"2px solid white",
              }} />
            </button>

            {/* Avatar */}
            <div style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer" }}>
              <div style={{
                width:36, height:36, borderRadius:9,
                background:"linear-gradient(135deg,#10B981,#059669)",
                display:"flex", alignItems:"center",
                justifyContent:"center",
                fontSize:12, fontWeight:700, color:"white",
                boxShadow:"0 2px 8px rgba(16,185,129,0.3)",
              }}>
                {initials}
              </div>
              <div style={{ display:"flex", flexDirection:"column" }}>
                <span style={{
                  fontSize:12, fontWeight:600,
                  color:"#0F172A", lineHeight:1.2,
                }}>{firstName}</span>
                <span style={{ fontSize:10, color:"#94A3B8" }}>Patient</span>
              </div>
              <ChevronDown size={13} color="#94A3B8" />
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