// user-panel/src/components/VideoConsultation.jsx
// FIXES:
//  ✅ Removed duplicate localVideoRef (was on 2 video elements — React only assigns to last)
//  ✅ ICE candidate buffering (candidates arriving before remoteDescription no longer dropped)
//  ✅ SIGNALING_URL → port 5001, BACKEND_URL → port 5000

import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { Video, VideoOff, Mic, MicOff, PhoneOff, ArrowLeft, Lock, Hash, AlertCircle, Users } from "lucide-react";

// ✅ FIX: correct ports
const SIGNALING_URL = import.meta.env.VITE_SIGNALING_URL || "http://localhost:5001";
const BACKEND_URL   = import.meta.env.VITE_BACKEND_URL   || "http://localhost:5000";

const ICE_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  {
    urls: "turn:relay1.expressturn.com:3478",
    username:   "ef2Z7F1ZKX6Z4Z7U",
    credential: "E4c3R9W8",
  },
];

export function VideoConsultation({ navigateTo }) {
  const [step,         setStep]         = useState("join"); // join | incall
  const [roomId,       setRoomId]       = useState("");
  const [password,     setPassword]     = useState("");
  const [verifying,    setVerifying]    = useState(false);
  const [error,        setError]        = useState("");
  const [peerConnected,setPeerConnected]= useState(false);
  const [micOn,        setMicOn]        = useState(true);
  const [camOn,        setCamOn]        = useState(true);
  const [audioOnly,    setAudioOnly]    = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // ✅ FIX: separate refs — localVideoRef for PiP only, remoteVideoRef for doctor feed
  const localVideoRef  = useRef(null);
  const remoteVideoRef = useRef(null);
  const socketRef      = useRef(null);
  const pcRef          = useRef(null);
  const localStreamRef = useRef(null);
  const timerRef       = useRef(null);
  const iceBufRef      = useRef([]); // ✅ FIX: buffer ICE candidates

  useEffect(() => {
    if (peerConnected) {
      timerRef.current = setInterval(() => setCallDuration(d => d + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [peerConnected]);

  const formatDuration = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const cleanup = () => {
    clearInterval(timerRef.current);
    try { socketRef.current?.disconnect(); } catch {}
    socketRef.current = null;
    try { pcRef.current?.close(); } catch {}
    pcRef.current = null;
    iceBufRef.current = [];
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    localStreamRef.current = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    if (localVideoRef.current)  localVideoRef.current.srcObject  = null;
  };

  useEffect(() => () => cleanup(), []);

  // ✅ FIX: flush buffered ICE after remoteDescription is set
  const flushIce = async (pc) => {
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

    // Verify credentials with backend
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BACKEND_URL}/api/meetings/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ roomId: roomId.trim().toUpperCase(), password: password.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.valid) {
        setError(data.message || "Invalid Meeting ID or Password.");
        setVerifying(false);
        return;
      }
    } catch {
      // Backend unreachable — proceed anyway in dev
      console.warn("Could not verify credentials — proceeding");
    }

    // Start WebRTC
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: !audioOnly,
        audio: true,
      });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      const socket = io(SIGNALING_URL, {
        transports: ["polling", "websocket"],
        reconnection: false,
        timeout: 8000,
      });
      socketRef.current = socket;

      const connected = await new Promise(res => {
        const t = setTimeout(() => res(false), 8000);
        socket.once("connect",       () => { clearTimeout(t); res(true); });
        socket.once("connect_error", () => { clearTimeout(t); res(false); });
      });

      if (!connected) {
        setError("Cannot reach signaling server. Make sure it's running on port 5001.");
        cleanup();
        setVerifying(false);
        return;
      }

      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
      pcRef.current = pc;

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "connected") setPeerConnected(true);
        if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
          setPeerConnected(false);
          if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
        }
      };

      pc.ontrack = (e) => {
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = e.streams[0];
        setPeerConnected(true);
      };

      pc.onicecandidate = ({ candidate }) => {
        if (candidate) socket.emit("ice", { roomId: roomId.trim().toUpperCase(), candidate });
      };

      stream.getTracks().forEach(t => pc.addTrack(t, stream));

      // Patient responds to doctor's offer
      socket.on("peer", ({ peerId }) => {
        // Patient does NOT create offer — waits for doctor's offer
        setPeerConnected(false);
      });

      socket.on("offer", async ({ from, offer }) => {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        await flushIce(pc); // ✅ flush buffered
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("answer", { to: from, answer });
      });

      // ✅ FIX: buffer ICE candidates received before remoteDescription is set
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
      setStep("incall");
    } catch (err) {
      setError("Could not access camera/microphone. Check browser permissions.");
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
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-8">
          <button
            onClick={() => navigateTo("dashboard")}
            className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>

          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-teal-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Video size={30} className="text-teal-400" />
            </div>
            <h1 className="text-white text-2xl font-bold">Join Consultation</h1>
            <p className="text-gray-400 text-sm mt-2">
              Enter the meeting details sent by your doctor
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-2">
                <Hash size={14} className="text-teal-400" /> Meeting ID
              </label>
              <input
                type="text"
                value={roomId}
                onChange={e => setRoomId(e.target.value.toUpperCase())}
                placeholder="e.g. AB12CD"
                className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono tracking-widest text-lg uppercase"
                maxLength={8}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-2">
                <Lock size={14} className="text-teal-400" /> Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter meeting password"
                className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                onKeyDown={e => e.key === "Enter" && joinMeeting()}
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
              <input
                type="checkbox"
                checked={audioOnly}
                onChange={e => setAudioOnly(e.target.checked)}
                className="w-4 h-4 accent-teal-500"
              />
              Audio only (no camera)
            </label>

            {error && (
              <div className="flex items-center gap-2 bg-red-900/40 text-red-400 rounded-xl px-4 py-3 text-sm border border-red-800">
                <AlertCircle size={16} className="shrink-0" /> {error}
              </div>
            )}

            <button
              onClick={joinMeeting}
              disabled={verifying || !roomId || !password}
              className="w-full py-3.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {verifying
                ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Joining…</>
                : <><Video size={18} /> Join Meeting</>}
            </button>

            <p className="text-center text-gray-500 text-xs">
              Check your email for Meeting ID and Password from your doctor.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── IN-CALL SCREEN ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <header className="bg-gray-800 px-6 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-white font-medium">Video Consultation</h1>
          <p className="text-gray-400 text-xs font-mono">Room: {roomId}</p>
        </div>
        <div className="flex items-center gap-3">
          {peerConnected ? (
            <span className="flex items-center gap-2 bg-green-900/50 text-green-400 text-xs px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Doctor connected · {formatDuration(callDuration)}
            </span>
          ) : (
            <span className="flex items-center gap-2 bg-yellow-900/50 text-yellow-400 text-xs px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
              Waiting for doctor…
            </span>
          )}
          <div className="flex items-center gap-1 bg-gray-700 text-gray-300 text-xs px-3 py-1.5 rounded-full">
            <Users size={12} /> {peerConnected ? "2" : "1"} / 2
          </div>
        </div>
      </header>

      <div className="flex-1 relative bg-gray-900">
        {/* Remote full-screen video (doctor) */}
        <video
          ref={remoteVideoRef}
          autoPlay playsInline
          className="w-full h-full object-cover"
          style={{ maxHeight: "calc(100vh - 130px)" }}
        />

        {!peerConnected && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 bg-teal-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video size={40} className="text-teal-400" />
              </div>
              <p className="text-white text-lg font-medium">Connected to room</p>
              <p className="text-gray-400 text-sm mt-1">Waiting for doctor to start…</p>
            </div>
          </div>
        )}

        {/* ✅ FIX: localVideoRef only HERE (PiP) — removed stray duplicate above */}
        <div className="absolute bottom-4 right-4 w-48 h-36 bg-gray-800 rounded-xl overflow-hidden border border-gray-600 shadow-lg">
          <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
          <span className="absolute bottom-2 left-2 text-white text-xs bg-black/60 px-2 py-0.5 rounded">You</span>
        </div>
      </div>

      <div className="bg-gray-800 py-4 flex items-center justify-center gap-4">
        <button
          onClick={toggleMic}
          className={`p-4 rounded-full transition-all ${micOn ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-red-600 hover:bg-red-700 text-white"}`}
        >
          {micOn ? <Mic size={20} /> : <MicOff size={20} />}
        </button>
        {!audioOnly && (
          <button
            onClick={toggleCam}
            className={`p-4 rounded-full transition-all ${camOn ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-red-600 hover:bg-red-700 text-white"}`}
          >
            {camOn ? <Video size={20} /> : <VideoOff size={20} />}
          </button>
        )}
        <button onClick={leaveCall} className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition-all">
          <PhoneOff size={20} />
        </button>
      </div>
    </div>
  );
}