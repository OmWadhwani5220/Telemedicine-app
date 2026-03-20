import React, { useState } from "react";
import {
  LayoutDashboard, Activity, CalendarPlus, Video,
  FolderHeart, ClipboardList, MessageCircle,
  Settings, LogOut, Stethoscope, Menu, X,
  Bell, Search, ChevronDown,
} from "lucide-react";

const NAV_TOP = [
  { id:"dashboard",    label:"Profile",         icon:LayoutDashboard, badge:null },
  { id:"appointments", label:"Appointment",     icon:CalendarPlus,    badge:10   },
  { id:"records",      label:"Doctors",         icon:FolderHeart,     badge:null },
  { id:"video",        label:"Schedule",        icon:Video,           badge:null },
  { id:"messages",     label:"Messages",        icon:MessageCircle,   badge:null },
  { id:"prescriptions",label:"Suppliments",     icon:ClipboardList,   badge:null },
];
const NAV_BOTTOM = [
  { id:"symptoms",  label:"Symptom Check", icon:Activity  },
  { id:"settings",  label:"Settings",      icon:Settings  },
];

export default function Layout({ children, screen, go, name, onLogout }) {
  const [open, setOpen] = useState(false);

  const isActive = id => screen === id || (screen==="recordDetails"&&id==="records");

  const NavItem = ({ id, label, icon:Icon, badge }) => {
    const active = isActive(id);
    return (
      <button onClick={() => { go(id); setOpen(false); }}
        style={{
          display:"flex", alignItems:"center", gap:14,
          padding:"11px 16px", borderRadius:10, width:"100%",
          border:"none", cursor:"pointer", textAlign:"left",
          fontFamily:"'Plus Jakarta Sans',sans-serif",
          fontSize:14, fontWeight: active ? 600 : 400,
          background: active ? "rgba(20,184,166,0.18)" : "transparent",
          color: active ? "#14B8A6" : "rgba(255,255,255,0.55)",
          transition:"all 0.15s ease", marginBottom:2,
          position:"relative",
        }}
        onMouseEnter={e=>{ if(!active){ e.currentTarget.style.background="rgba(255,255,255,0.06)"; e.currentTarget.style.color="rgba(255,255,255,0.85)"; }}}
        onMouseLeave={e=>{ if(!active){ e.currentTarget.style.background="transparent"; e.currentTarget.style.color="rgba(255,255,255,0.55)"; }}}
      >
        {/* Active indicator */}
        {active && (
          <span style={{
            position:"absolute", left:0, top:"50%", transform:"translateY(-50%)",
            width:3, height:20, background:"#14B8A6", borderRadius:"0 3px 3px 0",
          }}/>
        )}
        <div style={{
          width:34, height:34, borderRadius:9, display:"flex",
          alignItems:"center", justifyContent:"center", flexShrink:0,
          background: active ? "rgba(20,184,166,0.2)" : "rgba(255,255,255,0.05)",
        }}>
          <Icon size={17} />
        </div>
        <span style={{ flex:1 }}>{label}</span>
        {badge && (
          <span style={{
            background:"#14B8A6", color:"white", fontSize:10,
            fontWeight:700, padding:"2px 7px", borderRadius:10, minWidth:20, textAlign:"center",
          }}>{badge}</span>
        )}
      </button>
    );
  };

  const initials = name.split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase() || "P";

  const SidebarContent = () => (
    <div style={{
      width:240, background:"#111827", height:"100%",
      display:"flex", flexDirection:"column",
      borderRight:"1px solid rgba(255,255,255,0.06)",
    }}>
      {/* Logo */}
      <div style={{
        padding:"22px 20px 18px", borderBottom:"1px solid rgba(255,255,255,0.07)",
        display:"flex", alignItems:"center", gap:12,
      }}>
        <div style={{
          width:36, height:36, background:"linear-gradient(135deg,#14B8A6,#0D9488)",
          borderRadius:10, display:"flex", alignItems:"center",
          justifyContent:"center", flexShrink:0,
          boxShadow:"0 4px 12px rgba(20,184,166,0.35)",
        }}>
          <Stethoscope size={18} color="white" />
        </div>
        <span style={{ color:"white", fontSize:18, fontWeight:800, letterSpacing:"-0.3px", fontFamily:"'Plus Jakarta Sans',sans-serif" }}>MediCare</span>
      </div>

      {/* Main nav */}
      <div style={{ flex:1, padding:"16px 12px", overflowY:"auto" }}>
        <p style={{ fontSize:10, fontWeight:700, letterSpacing:"1px", textTransform:"uppercase", color:"rgba(255,255,255,0.2)", padding:"0 6px", marginBottom:10 }}>Main Menu</p>
        {NAV_TOP.map(item => <NavItem key={item.id} {...item} />)}
      </div>

      {/* Upgrade card */}
      <div style={{ padding:"12px 16px" }}>
        <div style={{
          background:"linear-gradient(135deg,rgba(20,184,166,0.2),rgba(13,148,136,0.3))",
          border:"1px solid rgba(20,184,166,0.25)", borderRadius:14,
          padding:"16px", marginBottom:12,
        }}>
          <div style={{ fontSize:22, marginBottom:6 }}>🚀</div>
          <p style={{ color:"rgba(255,255,255,0.6)", fontSize:11, marginBottom:2, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>You're on the Free plan.</p>
          <p style={{ color:"white", fontSize:12, fontWeight:700, fontFamily:"'Plus Jakarta Sans',sans-serif", marginBottom:12 }}>Upgrade to Go Pro</p>
          <button onClick={() => go("appointments")} style={{
            width:"100%", padding:"8px", borderRadius:8,
            background:"linear-gradient(135deg,#14B8A6,#0D9488)",
            border:"none", color:"white", fontSize:12, fontWeight:700,
            cursor:"pointer", fontFamily:"'Plus Jakarta Sans',sans-serif",
            boxShadow:"0 3px 10px rgba(20,184,166,0.4)",
          }}>Book Appointment</button>
        </div>

        {/* Bottom nav */}
        <div style={{ borderTop:"1px solid rgba(255,255,255,0.07)", paddingTop:10 }}>
          {NAV_BOTTOM.map(item => <NavItem key={item.id} {...item} />)}
          <button onClick={onLogout}
            style={{
              display:"flex", alignItems:"center", gap:14,
              padding:"11px 16px", borderRadius:10, width:"100%",
              border:"none", cursor:"pointer", textAlign:"left",
              fontFamily:"'Plus Jakarta Sans',sans-serif",
              fontSize:14, fontWeight:400, background:"transparent",
              color:"rgba(255,255,255,0.4)", transition:"all 0.15s ease",
            }}
            onMouseEnter={e=>{ e.currentTarget.style.background="rgba(239,68,68,0.1)"; e.currentTarget.style.color="#FCA5A5"; }}
            onMouseLeave={e=>{ e.currentTarget.style.background="transparent"; e.currentTarget.style.color="rgba(255,255,255,0.4)"; }}
          >
            <div style={{ width:34, height:34, borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(255,255,255,0.05)" }}>
              <LogOut size={17} />
            </div>
            Log Out
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ display:"flex", height:"100vh", overflow:"hidden", fontFamily:"'Plus Jakarta Sans',sans-serif" }}>

      {/* Desktop sidebar */}
      <div style={{ flexShrink:0 }} className="hidden lg:block">
        <SidebarContent />
      </div>

      {/* Mobile overlay */}
      {open && (
        <div onClick={()=>setOpen(false)} style={{
          position:"fixed", inset:0, background:"rgba(0,0,0,0.6)",
          zIndex:40, backdropFilter:"blur(3px)",
        }} className="lg:hidden" />
      )}

      {/* Mobile sidebar */}
      <div style={{
        position:"fixed", top:0, left:0, bottom:0, zIndex:50,
        transform: open ? "translateX(0)" : "translateX(-100%)",
        transition:"transform 0.25s cubic-bezier(0.4,0,0.2,1)",
      }} className="lg:hidden">
        <SidebarContent />
      </div>

      {/* Main area */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", background:"#F0F4F8" }}>

        {/* Top header bar */}
        <div style={{
          background:"white", borderBottom:"1px solid #E8EDF2",
          padding:"0 24px", height:64,
          display:"flex", alignItems:"center", justifyContent:"space-between",
          flexShrink:0, zIndex:20, boxShadow:"0 1px 3px rgba(0,0,0,0.04)",
        }}>
          {/* Left: hamburger + greeting */}
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <button onClick={()=>setOpen(!open)} className="lg:hidden" style={{
              width:36, height:36, borderRadius:8, border:"1.5px solid #E2E8F0",
              background:"white", cursor:"pointer",
              display:"flex", alignItems:"center", justifyContent:"center",
            }}>
              {open ? <X size={18} color="#475569"/> : <Menu size={18} color="#475569"/>}
            </button>
            <div className="hidden sm:block">
              <p style={{ fontSize:18, fontWeight:700, color:"#0F172A", lineHeight:1.2 }}>
                Hello, {name.split(" ")[0]} 👋
              </p>
              <p style={{ fontSize:12, color:"#94A3B8", marginTop:1 }}>Detailed information about your health</p>
            </div>
          </div>

          {/* Right: search + bell + avatar */}
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            {/* Search */}
            <div style={{ position:"relative" }} className="hidden md:flex">
              <Search size={15} color="#94A3B8" style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)" }} />
              <input placeholder="Search anything…" style={{
                paddingLeft:36, paddingRight:16, height:38, width:220,
                border:"1.5px solid #E8EDF2", borderRadius:10, fontSize:13,
                fontFamily:"'Plus Jakarta Sans',sans-serif", color:"#0F172A",
                background:"#F8FAFC", outline:"none",
              }} onFocus={e=>{e.target.style.borderColor="#14B8A6";e.target.style.background="white";}}
                 onBlur={e=>{e.target.style.borderColor="#E8EDF2";e.target.style.background="#F8FAFC";}} />
            </div>

            {/* Notifications */}
            <button style={{
              width:38, height:38, borderRadius:10, border:"1.5px solid #E8EDF2",
              background:"white", cursor:"pointer",
              display:"flex", alignItems:"center", justifyContent:"center",
              position:"relative",
            }}>
              <Bell size={17} color="#475569" />
              <span style={{ position:"absolute", top:8, right:8, width:7, height:7, background:"#EF4444", borderRadius:"50%", border:"2px solid white" }} />
            </button>

            {/* Avatar */}
            <div style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer" }}>
              <div style={{
                width:38, height:38, borderRadius:10,
                background:"linear-gradient(135deg,#14B8A6,#0D9488)",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:13, fontWeight:700, color:"white",
                boxShadow:"0 2px 8px rgba(20,184,166,0.3)",
              }}>{initials}</div>
              <ChevronDown size={14} color="#94A3B8" className="hidden sm:block" />
            </div>
          </div>
        </div>

        {/* Scrollable content */}
        <div style={{ flex:1, overflowY:"auto", padding:"0" }}>
          {children}
        </div>
      </div>
    </div>
  );
}