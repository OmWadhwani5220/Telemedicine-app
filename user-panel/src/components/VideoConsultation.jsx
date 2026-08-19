import React, { useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";
import {
  Video, VideoOff, Mic, MicOff, PhoneOff,
  ArrowLeft, Lock, Hash, AlertCircle, Users, Shield,
} from "lucide-react";

// ✅ FIX: correct ports
const SIGNALING_URL = import.meta.env.VITE_SIGNALING_URL || "http://localhost:5001";
const BACKEND_URL   = import.meta.env.VITE_BACKEND_URL   || "http://localhost:5000";

const BRAND = "#0d9286";
const BRAND_DARK = "#0a7a6f";
const BRAND_LIGHT = "rgba(13,146,134,0.15)";

const ICE_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  { urls: "turn:relay1.expressturn.com:3478", username: "ef2Z7F1ZKX6Z4Z7U", credential: "E4c3R9W8" },
];

export function VideoConsultation({ navigateTo }) {
  const [step,          setStep]          = useState("join");
  const [roomId,        setRoomId]        = useState("");
  const [password,      setPassword]      = useState("");
  const [verifying,     setVerifying]     = useState(false);
  const [error,         setError]         = useState("");
  const [peerConnected, setPeerConnected] = useState(false);
  const [micOn,         setMicOn]         = useState(true);
  const [camOn,         setCamOn]         = useState(true);
  const [audioOnly,     setAudioOnly]     = useState(false);
  const [callDuration,  setCallDuration]  = useState(0);

  // ✅ FIX: ONE ref per video element — the old code had localVideoRef on TWO elements
  const localVideoRef  = useRef(null);
  const remoteVideoRef = useRef(null);
  const socketRef      = useRef(null);
  const pcRef          = useRef(null);
  const peerIdRef      = useRef(null);
  const localStreamRef = useRef(null);
  const timerRef       = useRef(null);
  const iceBufRef      = useRef([]); // ✅ FIX: buffer ICE before remoteDescription set

  // ✅ FIX: runs after EVERY render — re-attaches stream when step changes & DOM remounts
  useEffect(() => {
    if (
      localStreamRef.current &&
      localVideoRef.current &&
      localVideoRef.current.srcObject !== localStreamRef.current
    ) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
  });

  useEffect(() => {
    if (peerConnected) {
      timerRef.current = setInterval(() => setCallDuration(d => d + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [peerConnected]);

  const fmt = s =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const cleanup = useCallback(() => {
    clearInterval(timerRef.current);
    try { socketRef.current?.disconnect(); } catch {}
    socketRef.current  = null;
    peerIdRef.current  = null;
    iceBufRef.current  = [];
    try { pcRef.current?.close(); } catch {}
    pcRef.current = null;
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    localStreamRef.current = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
  }, []);

  useEffect(() => () => cleanup(), [cleanup]);

  const flushIce = async pc => {
    for (const c of iceBufRef.current) {
      try { await pc.addIceCandidate(new RTCIceCandidate(c)); } catch {}
    }
    iceBufRef.current = [];
  };

  const joinMeeting = async () => {
    if (!roomId.trim() || !password.trim()) {
      setError("Please enter both Meeting ID and Password.");
      return;
    }
    setVerifying(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BACKEND_URL}/api/meetings/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        credentials: "include",
        body: JSON.stringify({ roomId: roomId.trim().toUpperCase(), password: password.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.valid) {
        setError(data.message || "Invalid Meeting ID or Password. Please check your email.");
        setVerifying(false);
        return;
      }
    } catch {
      console.warn("Could not verify — proceeding");
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: !audioOnly, audio: true });
      localStreamRef.current = stream;
      // ✅ stream will be attached to <video> by the always-running useEffect after setStep

      const socket = io(SIGNALING_URL, {
        transports: ["polling", "websocket"], // polling first — always works
        reconnection: false,
        timeout: 8000,
      });
      socketRef.current = socket;

      const ok = await new Promise(res => {
        const t = setTimeout(() => res(false), 8000);
        socket.once("connect",       () => { clearTimeout(t); res(true); });
        socket.once("connect_error", () => { clearTimeout(t); res(false); });
      });

      if (!ok) {
        setError("Cannot reach signaling server on port 5001. Make sure it is running.");
        stream.getTracks().forEach(t => t.stop());
        setVerifying(false);
        return;
      }

      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
      pcRef.current = pc;

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "connected")  { setPeerConnected(true); setError(""); }
        if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
          setPeerConnected(false);
          if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
        }
      };

      pc.ontrack = e => {
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = e.streams[0];
        setPeerConnected(true);
      };

      pc.onicecandidate = ({ candidate }) => {
        if (candidate) socket.emit("ice", { roomId: roomId.trim().toUpperCase(), candidate });
      };

      stream.getTracks().forEach(t => pc.addTrack(t, stream));

      // Patient answers the doctor's offer
      socket.on("offer", async ({ from, offer }) => {
        peerIdRef.current = from;
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(offer));
          await flushIce(pc);
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit("answer", { to: from, answer });
          setPeerConnected(true);
        } catch (e) { console.error("answer error", e); }
      });

      // ✅ FIX: buffer ICE candidates before remoteDescription is ready
      socket.on("ice", async ({ candidate }) => {
        if (!candidate) return;
        if (pc.remoteDescription?.type) {
          try { await pc.addIceCandidate(new RTCIceCandidate(candidate)); } catch {}
        } else {
          iceBufRef.current.push(candidate);
        }
      });

      socket.on("peer-left", () => {
        setPeerConnected(false);
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
      });

      socket.emit("join", { roomId: roomId.trim().toUpperCase() });
      setStep("incall"); // re-render → always-running effect attaches stream to new <video>
    } catch {
      setError("Could not access camera/microphone. Please allow permissions in your browser.");
      cleanup();
    } finally {
      setVerifying(false);
    }
  };

  const leaveCall = () => {
    socketRef.current?.emit("leave", { roomId });
    cleanup();
    setPeerConnected(false);
    setCallDuration(0);
    setStep("join");
    setRoomId("");
    setPassword("");
  };

  const toggleMic = () => {
    localStreamRef.current?.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
    setMicOn(v => !v);
  };
  const toggleCam = () => {
    localStreamRef.current?.getVideoTracks().forEach(t => { t.enabled = !t.enabled; });
    setCamOn(v => !v);
  };

  // ── JOIN SCREEN ─────────────────────────────────────────────────────────────
  if (step === "join") {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(145deg, #0a0f1e 0%, #0d2d2a 45%, #0a0f1e 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        fontFamily: "system-ui, -apple-system, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorative blobs */}
        <div style={{ position:"absolute", top:-120, right:-100, width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle, rgba(13,146,134,0.15) 0%, transparent 70%)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:-80, left:-80, width:300, height:300, borderRadius:"50%", background:"radial-gradient(circle, rgba(13,146,134,0.1) 0%, transparent 70%)", pointerEvents:"none" }} />

        <div style={{ width:"100%", maxWidth:440, position:"relative", zIndex:1 }}>
          {/* Back */}
          <button
            onClick={() => navigateTo("dashboard")}
            style={{ display:"flex", alignItems:"center", gap:8, background:"none", border:"none", cursor:"pointer", color:"rgba(255,255,255,0.45)", fontSize:13, marginBottom:24, padding:0, transition:"color 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.85)"}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.45)"}
          >
            <ArrowLeft size={15} /> Back to Dashboard
          </button>

          {/* Card */}
          <div style={{
            background: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.09)",
            borderRadius: 24,
            padding: "36px 32px",
            boxShadow: "0 32px 64px rgba(0,0,0,0.45)",
          }}>
            {/* Icon + Heading */}
            <div style={{ textAlign:"center", marginBottom:32 }}>
              <div style={{
                width:72, height:72, margin:"0 auto 18px",
                background: `linear-gradient(135deg, ${BRAND}33, ${BRAND}1a)`,
                border: `1px solid ${BRAND}55`,
                borderRadius:20,
                display:"flex", alignItems:"center", justifyContent:"center",
                boxShadow:`0 8px 24px ${BRAND}30`,
              }}>
                <Video size={30} color={BRAND} />
              </div>
              <h1 style={{ margin:0, fontSize:22, fontWeight:800, color:"#f1f5f9", letterSpacing:"-0.04em" }}>
                Join Consultation
              </h1>
              <p style={{ margin:"8px 0 0", fontSize:13, color:"rgba(255,255,255,0.4)", lineHeight:1.6 }}>
                Enter the credentials your doctor sent by email
              </p>
            </div>

            {/* Fields */}
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

              {/* Meeting ID */}
              <div>
                <label style={{ display:"flex", alignItems:"center", gap:6, fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.45)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:8 }}>
                  <Hash size={11} color={BRAND} /> Meeting ID
                </label>
                <input
                  type="text"
                  value={roomId}
                  onChange={e => { setRoomId(e.target.value.toUpperCase()); setError(""); }}
                  placeholder="AB12CD"
                  maxLength={8}
                  style={{
                    width:"100%", boxSizing:"border-box",
                    background:"rgba(255,255,255,0.06)",
                    border:"1.5px solid rgba(255,255,255,0.1)",
                    borderRadius:14, padding:"14px 20px",
                    color:"#f1f5f9", fontSize:24,
                    fontFamily:"'JetBrains Mono', 'Courier New', monospace",
                    letterSpacing:10, textAlign:"center",
                    textTransform:"uppercase", outline:"none",
                    transition:"border-color 0.2s, box-shadow 0.2s",
                  }}
                  onFocus={e => { e.target.style.borderColor = BRAND; e.target.style.boxShadow = `0 0 0 3px ${BRAND}22`; }}
                  onBlur={e  => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }}
                />
              </div>

              {/* Password */}
              <div>
                <label style={{ display:"flex", alignItems:"center", gap:6, fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.45)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:8 }}>
                  <Lock size={11} color={BRAND} /> Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(""); }}
                  placeholder="Enter meeting password"
                  onKeyDown={e => e.key === "Enter" && joinMeeting()}
                  style={{
                    width:"100%", boxSizing:"border-box",
                    background:"rgba(255,255,255,0.06)",
                    border:"1.5px solid rgba(255,255,255,0.1)",
                    borderRadius:14, padding:"13px 18px",
                    color:"#f1f5f9", fontSize:15, outline:"none",
                    transition:"border-color 0.2s, box-shadow 0.2s",
                  }}
                  onFocus={e => { e.target.style.borderColor = BRAND; e.target.style.boxShadow = `0 0 0 3px ${BRAND}22`; }}
                  onBlur={e  => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; }}
                />
              </div>

              {/* Audio only */}
              <label style={{ display:"flex", alignItems:"center", gap:12, cursor:"pointer", padding:"11px 14px", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12 }}>
                <input
                  type="checkbox"
                  checked={audioOnly}
                  onChange={e => setAudioOnly(e.target.checked)}
                  style={{ width:16, height:16, accentColor:BRAND, cursor:"pointer", flexShrink:0 }}
                />
                <div>
                  <p style={{ margin:0, fontSize:13, fontWeight:500, color:"rgba(255,255,255,0.75)" }}>Audio only mode</p>
                  <p style={{ margin:0, fontSize:11, color:"rgba(255,255,255,0.3)", marginTop:2 }}>Disable camera to save bandwidth</p>
                </div>
              </label>

              {/* Error */}
              {error && (
                <div style={{ display:"flex", alignItems:"flex-start", gap:10, background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.25)", borderRadius:12, padding:"12px 14px" }}>
                  <AlertCircle size={15} color="#f87171" style={{ flexShrink:0, marginTop:1 }} />
                  <p style={{ margin:0, fontSize:13, color:"#f87171", lineHeight:1.5 }}>{error}</p>
                </div>
              )}

              {/* Join Button */}
              <button
                onClick={joinMeeting}
                disabled={verifying || !roomId.trim() || !password.trim()}
                style={{
                  width:"100%", padding:"15px",
                  background: (verifying || !roomId.trim() || !password.trim())
                    ? `${BRAND}55`
                    : `linear-gradient(135deg, ${BRAND}, ${BRAND_DARK})`,
                  color:"#fff", border:"none", borderRadius:14,
                  fontSize:15, fontWeight:700,
                  display:"flex", alignItems:"center", justifyContent:"center", gap:10,
                  cursor: (verifying || !roomId.trim() || !password.trim()) ? "not-allowed" : "pointer",
                  boxShadow: `0 6px 24px ${BRAND}40`,
                  transition:"all 0.2s", marginTop:4,
                  fontFamily:"inherit",
                }}
                onMouseEnter={e => { if (!verifying && roomId.trim() && password.trim()) e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; }}
              >
                {verifying ? (
                  <>
                    <span style={{ width:18, height:18, border:"2.5px solid rgba(255,255,255,0.35)", borderTopColor:"#fff", borderRadius:"50%", animation:"vcSpin 0.8s linear infinite", flexShrink:0 }} />
                    Joining meeting…
                  </>
                ) : (
                  <><Video size={18} /> Join Video Call</>
                )}
              </button>
            </div>

            {/* Info */}
            <div style={{ marginTop:20, display:"flex", alignItems:"flex-start", gap:10, padding:"12px 14px", background:`${BRAND}0d`, border:`1px solid ${BRAND}22`, borderRadius:12 }}>
              <Shield size={14} color={BRAND} style={{ flexShrink:0, marginTop:1 }} />
              <p style={{ margin:0, fontSize:12, color:"rgba(255,255,255,0.4)", lineHeight:1.6 }}>
                Your video call is encrypted end-to-end. Check your email for the Meeting ID and Password from your doctor.
              </p>
            </div>
          </div>
        </div>

        <style>{`@keyframes vcSpin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ── IN-CALL SCREEN ──────────────────────────────────────────────────────────
  return (
    <div style={{ height:"100vh", background:"#0a0c12", display:"flex", flexDirection:"column", fontFamily:"system-ui,sans-serif" }}>

      {/* Header */}
      <header style={{ background:"#111827", borderBottom:"1px solid rgba(255,255,255,0.07)", padding:"0 20px", height:52, display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:32, height:32, borderRadius:9, background:`${BRAND}25`, border:`1px solid ${BRAND}40`, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Video size={15} color={BRAND} />
          </div>
          <div>
            <p style={{ margin:0, fontSize:13, fontWeight:600, color:"#f1f5f9" }}>Video Consultation</p>
            <p style={{ margin:0, fontSize:10, color:"rgba(255,255,255,0.35)", fontFamily:"monospace", letterSpacing:1 }}>ROOM: {roomId}</p>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          {peerConnected ? (
            <span style={{ display:"flex", alignItems:"center", gap:6, background:"rgba(34,197,94,0.1)", border:"1px solid rgba(34,197,94,0.25)", color:"#4ade80", fontSize:11, padding:"5px 12px", borderRadius:100, fontWeight:500 }}>
              <span style={{ width:6, height:6, borderRadius:"50%", background:"#4ade80", animation:"vcPulse 1.5s ease infinite" }} />
              Doctor connected · {fmt(callDuration)}
            </span>
          ) : (
            <span style={{ display:"flex", alignItems:"center", gap:6, background:"rgba(234,179,8,0.1)", border:"1px solid rgba(234,179,8,0.2)", color:"#facc15", fontSize:11, padding:"5px 12px", borderRadius:100, fontWeight:500 }}>
              <span style={{ width:6, height:6, borderRadius:"50%", background:"#facc15", animation:"vcPulse 1.5s ease infinite" }} />
              Waiting for doctor…
            </span>
          )}
          <span style={{ display:"flex", alignItems:"center", gap:5, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", color:"rgba(255,255,255,0.45)", fontSize:11, padding:"5px 10px", borderRadius:100 }}>
            <Users size={11} /> {peerConnected ? "2" : "1"} / 2
          </span>
        </div>
      </header>

      {/* Video area */}
      <div style={{ flex:1, position:"relative", overflow:"hidden", background:"#0a0c12" }}>
        {/* Remote full-screen */}
        <video ref={remoteVideoRef} autoPlay playsInline style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover" }} />

        {/* Waiting overlay */}
        {!peerConnected && (
          <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:14, background:"rgba(10,12,18,0.92)", zIndex:2 }}>
            <div style={{ width:90, height:90, borderRadius:"50%", background:`${BRAND}15`, border:`2px solid ${BRAND}30`, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Video size={36} color={BRAND} />
            </div>
            <p style={{ color:"rgba(255,255,255,0.7)", fontSize:15, fontWeight:500, margin:0 }}>
              Connected to room
            </p>
            <p style={{ color:"rgba(255,255,255,0.35)", fontSize:12, margin:0 }}>
              Waiting for your doctor to start…
            </p>
          </div>
        )}

        {/* ✅ FIX: localVideoRef ONLY on this PiP element (was duplicated before → caused black video) */}
        <div style={{ position:"absolute", bottom:72, right:16, width:176, height:132, borderRadius:14, overflow:"hidden", border:`2px solid rgba(255,255,255,0.12)`, boxShadow:"0 8px 32px rgba(0,0,0,0.6)", zIndex:10, background:"#111" }}>
          <video
            ref={localVideoRef}
            autoPlay muted playsInline
            style={{ width:"100%", height:"100%", objectFit:"cover", transform:"scaleX(-1)", display:"block" }}
          />
          {!camOn && (
            <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.8)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <VideoOff size={22} color="rgba(255,255,255,0.4)" />
            </div>
          )}
          <span style={{ position:"absolute", bottom:6, left:8, fontSize:10, fontWeight:600, color:"rgba(255,255,255,0.8)", background:"rgba(0,0,0,0.55)", padding:"2px 7px", borderRadius:100 }}>
            You
          </span>
        </div>
      </div>

      {/* Controls */}
      <div style={{ background:"#111827", borderTop:"1px solid rgba(255,255,255,0.07)", height:68, display:"flex", alignItems:"center", justifyContent:"center", gap:16, flexShrink:0 }}>
        <CtrlBtn active={micOn} onClick={toggleMic} activeIcon={<Mic size={19}/>} offIcon={<MicOff size={19}/>} label={micOn?"Mute":"Unmute"} />
        {!audioOnly && (
          <CtrlBtn active={camOn} onClick={toggleCam} activeIcon={<Video size={19}/>} offIcon={<VideoOff size={19}/>} label={camOn?"Camera":"No Cam"} />
        )}
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
          <button
            onClick={leaveCall}
            style={{ width:50, height:50, borderRadius:"50%", background:"#dc2626", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 4px 18px rgba(220,38,38,0.45)", transition:"all 0.2s" }}
          >
            <PhoneOff size={20} color="#fff" />
          </button>
          <span style={{ fontSize:10, color:"rgba(255,255,255,0.35)", fontWeight:500 }}>Leave</span>
        </div>
      </div>

      <style>{`
        @keyframes vcSpin  { to { transform: rotate(360deg); } }
        @keyframes vcPulse { 0%,100% { opacity:1; } 50% { opacity:0.35; } }
      `}</style>
    </div>
  );
}

function CtrlBtn({ active, onClick, activeIcon, offIcon, label }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
      <button
        onClick={onClick}
        style={{
          width:50, height:50, borderRadius:"50%", border:"none", cursor:"pointer",
          display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.2s",
          background: active ? "rgba(255,255,255,0.1)" : "rgba(239,68,68,0.2)",
          color: active ? "#fff" : "#f87171",
        }}
      >
        {active ? activeIcon : (offIcon || activeIcon)}
      </button>
      <span style={{ fontSize:10, color:"rgba(255,255,255,0.35)", fontWeight:500 }}>{label}</span>
    </div>
  );
}