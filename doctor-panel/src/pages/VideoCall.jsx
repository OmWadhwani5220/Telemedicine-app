import { useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";
import Sidebar from "../components/Sidebar";
import {
  Video, VideoOff, Mic, MicOff, PhoneOff,
  Copy, Mail, Users, Check, Loader2, AlertCircle,
  Plus, Trash2, Save, FileText, ChevronDown, ChevronUp,
} from "lucide-react";

const SIGNALING_URL = import.meta.env.VITE_SIGNALING_URL || "http://localhost:5001";
const BACKEND_URL   = import.meta.env.VITE_BACKEND_URL   || "http://localhost:5000";

const ICE_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  { urls: "turn:relay1.expressturn.com:3478", username: "ef2Z7F1ZKX6Z4Z7U", credential: "E4c3R9W8" },
];

const generateRoomId   = () => Math.random().toString(36).substring(2, 8).toUpperCase();
const generatePassword = () => Math.random().toString(36).substring(2, 10);

const emptyPrescription = () => ({
  diagnosis:    "",
  medications:  [{ name: "", dosage: "", frequency: "", duration: "" }],
  instructions: "",
  followUpDate: "",
  notes:        "",
});

export default function VideoCall() {
  const [isExpanded,    setIsExpanded]    = useState(false);
  const [step,          setStep]          = useState("setup");
  const [roomId,        setRoomId]        = useState("");
  const [password,      setPassword]      = useState("");
  const [patientEmail,  setPatientEmail]  = useState("");
  const [patientName,   setPatientName]   = useState("");
  const [emailSent,     setEmailSent]     = useState(false);
  const [sendingEmail,  setSendingEmail]  = useState(false);
  const [copied,        setCopied]        = useState(false);
  const [peerConnected, setPeerConnected] = useState(false);
  const [audioOnly,     setAudioOnly]     = useState(false);
  const [micOn,         setMicOn]         = useState(true);
  const [camOn,         setCamOn]         = useState(true);
  const [callDuration,  setCallDuration]  = useState(0);
  const [error,         setError]         = useState("");

  // Prescription state
  const [rx,         setRx]         = useState(emptyPrescription());
  const [rxSaving,   setRxSaving]   = useState(false);
  const [rxSaved,    setRxSaved]    = useState(false);
  const [rxError,    setRxError]    = useState("");
  const [rxExpanded, setRxExpanded] = useState(true);

  // Doctor name from localStorage (set at login — no extra API call needed)
  const doctorName = localStorage.getItem("name") || "Doctor";

  const localVideoRef  = useRef(null);
  const remoteVideoRef = useRef(null);
  const socketRef      = useRef(null);
  const pcRef          = useRef(null);
  const peerIdRef      = useRef(null);
  const localStreamRef = useRef(null);
  const timerRef       = useRef(null);
  const iceBufRef      = useRef([]);

  useEffect(() => {
    setRoomId(generateRoomId());
    setPassword(generatePassword());
  }, []);

  // ── FIX 1: Re-attach local stream to video element after EVERY render ──────
  // When setStep("incall") causes a re-render, the <video> element in the
  // in-call screen is brand new — srcObject must be set again.
  useEffect(() => {
    if (localStreamRef.current && localVideoRef.current &&
        localVideoRef.current.srcObject !== localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
  }); // no dependency array → runs after every render

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
    socketRef.current = null;
    try { pcRef.current?.close(); } catch {}
    pcRef.current = null;
    peerIdRef.current = null;
    iceBufRef.current = [];
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    localStreamRef.current = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
  }, []);

  useEffect(() => () => cleanup(), [cleanup]);

  const flushIce = async (pc) => {
    for (const c of iceBufRef.current) {
      try { await pc.addIceCandidate(new RTCIceCandidate(c)); } catch {}
    }
    iceBufRef.current = [];
  };

  // ── Prescription helpers ───────────────────────────────────────────────────
  const addMed = () =>
    setRx(r => ({ ...r, medications: [...r.medications, { name: "", dosage: "", frequency: "", duration: "" }] }));

  const removeMed = (i) =>
    setRx(r => ({ ...r, medications: r.medications.filter((_, idx) => idx !== i) }));

  const updateMed = (i, field, val) =>
    setRx(r => {
      const meds = [...r.medications];
      meds[i] = { ...meds[i], [field]: val };
      return { ...r, medications: meds };
    });

  const savePrescription = async () => {
    if (!patientEmail) { setRxError("Enter patient email in the setup screen first."); return; }
    setRxSaving(true);
    setRxSaved(false);
    setRxError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BACKEND_URL}/api/prescriptions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        credentials: "include",
        body: JSON.stringify({
          meetingId:    roomId,
          patientEmail,
          patientName,
          doctorName,
          prescription: rx,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRxSaved(true);
        setTimeout(() => setRxSaved(false), 3000);
      } else {
        setRxError(data.message || "Failed to save");
      }
    } catch {
      setRxError("Network error — check backend");
    } finally {
      setRxSaving(false);
    }
  };

  // ── Send email invite ──────────────────────────────────────────────────────
  const sendMeetingEmail = async () => {
    if (!patientEmail) return;
    setSendingEmail(true);
    setEmailSent(false);
    setError("");
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${BACKEND_URL}/api/meetings/send-invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        credentials: "include",
        body: JSON.stringify({ patientEmail, patientName, roomId, password, doctorName }),
      });
      const data = await res.json();
      if (res.ok && data.success) { setEmailSent(true); }
      else { setError(data.message || "Failed to send email"); }
    } catch { setError("Network error — is the backend running?"); }
    finally { setSendingEmail(false); }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`Meeting ID: ${roomId}\nPassword: ${password}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Start WebRTC call ──────────────────────────────────────────────────────
  const startCall = async () => {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: !audioOnly, audio: true });
      localStreamRef.current = stream;
      // srcObject is set by the always-running useEffect after step changes

      const socket = io(SIGNALING_URL, { transports: ["polling", "websocket"], reconnection: false, timeout: 8000 });
      socketRef.current = socket;

      const connected = await new Promise(res => {
        const t = setTimeout(() => res(false), 8000);
        socket.once("connect",       () => { clearTimeout(t); res(true); });
        socket.once("connect_error", () => { clearTimeout(t); res(false); });
      });

      if (!connected) {
        setError("Cannot reach signaling server on port 5001. Run: cd videoserver && npm start");
        stream.getTracks().forEach(t => t.stop());
        return;
      }

      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
      pcRef.current = pc;

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "connected")  { setPeerConnected(true);  setError(""); }
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
        if (candidate && peerIdRef.current)
          socket.emit("ice", { to: peerIdRef.current, candidate });
      };

      stream.getTracks().forEach(t => pc.addTrack(t, stream));

      socket.on("peer", async ({ peerId }) => {
        peerIdRef.current = peerId;
        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit("offer", { to: peerId, offer });
        } catch (e) { console.error("offer error:", e); }
      });

      socket.on("answer", async ({ answer }) => {
        try { await pc.setRemoteDescription(new RTCSessionDescription(answer)); await flushIce(pc); }
        catch (e) { console.error("answer error:", e); }
      });

      socket.on("ice", async ({ candidate }) => {
        if (!candidate) return;
        if (pc.remoteDescription?.type) {
          try { await pc.addIceCandidate(new RTCIceCandidate(candidate)); } catch {}
        } else { iceBufRef.current.push(candidate); }
      });

      socket.on("peer-left", () => {
        setPeerConnected(false);
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
      });

      socket.emit("join", { roomId });
      setStep("incall"); // ← after this render, useEffect re-attaches localStream
    } catch {
      setError("Could not access camera/microphone. Check browser permissions.");
    }
  };

  const endCall = () => {
    socketRef.current?.emit("leave", { roomId });
    cleanup();
    setPeerConnected(false);
    setCallDuration(0);
    setStep("setup");
    setRx(emptyPrescription());
  };

  const toggleMic = () => {
    localStreamRef.current?.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
    setMicOn(v => !v);
  };
  const toggleCam = () => {
    localStreamRef.current?.getVideoTracks().forEach(t => { t.enabled = !t.enabled; });
    setCamOn(v => !v);
  };

  // ── SETUP SCREEN ────────────────────────────────────────────────────────────
  if (step === "setup") {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
        <div className={`flex-1 transition-all duration-300 ${isExpanded ? "ml-64" : "ml-16"} p-6`}>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Video Consultation</h1>
          <p className="text-sm text-gray-500 mb-6">Signed in as Dr. <span className="text-teal-600 font-medium">{doctorName}</span></p>

          <div className="max-w-2xl space-y-5">
            {/* Credentials */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4">Meeting Credentials</h2>
              <div className="grid grid-cols-2 gap-6 mb-4">
                <div className="bg-teal-50 rounded-xl p-4">
                  <p className="text-xs font-medium text-teal-600 mb-1 uppercase tracking-wider">Meeting ID</p>
                  <p className="text-2xl font-mono font-bold text-teal-700 tracking-widest">{roomId}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Password</p>
                  <p className="text-xl font-mono font-bold text-gray-700 tracking-wide">{password}</p>
                </div>
              </div>
              <button onClick={copyToClipboard}
                className="flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 font-medium">
                {copied ? <><Check size={14} />Copied!</> : <><Copy size={14} />Copy both</>}
              </button>
            </div>

            {/* Email invite */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4">Patient Info & Invite</h2>
              <div className="space-y-3">
                <input value={patientName} onChange={e => setPatientName(e.target.value)}
                  placeholder="Patient full name"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
                <input type="email" value={patientEmail} onChange={e => { setPatientEmail(e.target.value); setEmailSent(false); setError(""); }}
                  placeholder="Patient email *"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />

                {emailSent && (
                  <div className="flex items-center gap-2 bg-green-50 text-green-700 rounded-xl px-4 py-3 text-sm border border-green-200">
                    <Check size={16} /> Invite sent to <strong>{patientEmail}</strong>
                  </div>
                )}
                {error && (
                  <div className="flex items-start gap-2 bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm border border-red-200">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" /><span>{error}</span>
                  </div>
                )}
                <button onClick={sendMeetingEmail} disabled={sendingEmail || !patientEmail.trim()}
                  className="w-full py-2.5 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-xl font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50 border border-teal-200 text-sm">
                  {sendingEmail ? <><Loader2 size={15} className="animate-spin" />Sending…</> : <><Mail size={15} />Send Invite Email</>}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <label className="flex items-center gap-3 text-sm text-gray-600 cursor-pointer">
                <input type="checkbox" checked={audioOnly} onChange={e => setAudioOnly(e.target.checked)} className="w-4 h-4 accent-teal-500" />
                Audio only (no camera)
              </label>
            </div>

            <button onClick={startCall}
              className="w-full py-4 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl font-bold text-base flex items-center justify-center gap-3 shadow-lg shadow-teal-200 transition-all">
              <Video size={20} /> Start Consultation
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── IN-CALL SCREEN ──────────────────────────────────────────────────────────
  return (
    <div className="h-screen bg-gray-900 flex flex-col overflow-hidden">

      {/* Header */}
      <header className="bg-gray-800 px-5 py-2.5 flex items-center justify-between flex-shrink-0 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="bg-teal-600/20 rounded-lg p-1.5">
            <Video size={16} className="text-teal-400" />
          </div>
          <div>
            <p className="text-white text-sm font-medium leading-tight">Video Consultation</p>
            <p className="text-gray-400 text-xs font-mono">Room: {roomId}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {peerConnected ? (
            <span className="flex items-center gap-1.5 bg-green-900/50 text-green-400 text-xs px-3 py-1.5 rounded-full border border-green-800/50">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              Patient connected · {fmt(callDuration)}
            </span>
          ) : (
            <span className="flex items-center gap-1.5 bg-yellow-900/50 text-yellow-400 text-xs px-3 py-1.5 rounded-full border border-yellow-800/50">
              <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" />
              Waiting for patient…
            </span>
          )}
          <div className="flex items-center gap-1 bg-gray-700 text-gray-400 text-xs px-2.5 py-1.5 rounded-full">
            <Users size={11} /> {peerConnected ? "2" : "1"} / 2
          </div>
        </div>
      </header>

      {/* Main area: video (left) + prescription notepad (right) */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── LEFT: Video area ───────────────────────────────────────────── */}
        <div className="flex-1 relative bg-gray-900 overflow-hidden">
          {/* Remote video (full area) */}
          <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />

          {/* Waiting state */}
          {!peerConnected && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900/90">
              <div className="text-center">
                <div className="w-20 h-20 bg-teal-900/40 rounded-full flex items-center justify-center mx-auto mb-4 ring-2 ring-teal-700/30">
                  <Users size={36} className="text-teal-400" />
                </div>
                <p className="text-white text-lg font-medium">Waiting for patient</p>
                <p className="text-gray-500 text-sm mt-1 font-mono">{roomId}</p>
              </div>
            </div>
          )}

          {/* ── FIX: Local PiP — localVideoRef ONLY here ─────────────────── */}
          {/* srcObject is attached by the always-running useEffect above     */}
          <div className="absolute bottom-16 right-3 w-44 h-33 bg-gray-800 rounded-xl overflow-hidden border-2 border-gray-600 shadow-2xl"
               style={{ height: "8.5rem" }}>
            <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover scale-x-[-1]" />
            {!camOn && (
              <div className="absolute inset-0 bg-gray-900/90 flex items-center justify-center">
                <VideoOff size={22} className="text-gray-500" />
              </div>
            )}
            <span className="absolute bottom-1.5 left-2 text-white text-xs bg-black/60 px-1.5 py-0.5 rounded">You</span>
          </div>

          {/* Controls */}
          <div className="absolute bottom-0 left-0 right-0 py-3 flex items-center justify-center gap-3 bg-gradient-to-t from-gray-900/95 to-transparent">
            <button onClick={toggleMic} title={micOn ? "Mute" : "Unmute"}
              className={`p-3.5 rounded-full transition-all ${micOn ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-red-600 hover:bg-red-700 text-white"}`}>
              {micOn ? <Mic size={18} /> : <MicOff size={18} />}
            </button>
            {!audioOnly && (
              <button onClick={toggleCam} title={camOn ? "Stop camera" : "Start camera"}
                className={`p-3.5 rounded-full transition-all ${camOn ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-red-600 hover:bg-red-700 text-white"}`}>
                {camOn ? <Video size={18} /> : <VideoOff size={18} />}
              </button>
            )}
            <button onClick={endCall} title="End call"
              className="p-3.5 rounded-full bg-red-600 hover:bg-red-700 text-white transition-all shadow-lg shadow-red-900/50">
              <PhoneOff size={18} />
            </button>
          </div>
        </div>

        {/* ── RIGHT: Prescription Notepad ─────────────────────────────────── */}
        <div className="w-80 bg-gray-850 border-l border-gray-700 flex flex-col overflow-hidden"
             style={{ background: "#1a1f2e" }}>

          {/* Notepad header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700 flex-shrink-0">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-teal-400" />
              <span className="text-white text-sm font-semibold">Prescription</span>
              <span className="text-xs bg-teal-900/50 text-teal-400 px-2 py-0.5 rounded-full border border-teal-800/50">
                Encrypted
              </span>
            </div>
            <button onClick={() => setRxExpanded(v => !v)} className="text-gray-500 hover:text-gray-300">
              {rxExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>

          {rxExpanded && (
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 scrollbar-thin scrollbar-thumb-gray-700">

              {/* Patient info (read-only reminder) */}
              {patientEmail && (
                <div className="bg-gray-800/60 rounded-lg px-3 py-2 border border-gray-700">
                  <p className="text-xs text-gray-500">Patient</p>
                  <p className="text-sm text-white font-medium truncate">{patientName || patientEmail}</p>
                  <p className="text-xs text-gray-500 truncate">{patientEmail}</p>
                </div>
              )}
              {!patientEmail && (
                <div className="bg-yellow-900/20 border border-yellow-800/40 rounded-lg px-3 py-2">
                  <p className="text-xs text-yellow-500">⚠ Patient email not set. Go back to setup to enter it.</p>
                </div>
              )}

              {/* Diagnosis */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Diagnosis</label>
                <textarea
                  value={rx.diagnosis}
                  onChange={e => setRx(r => ({ ...r, diagnosis: e.target.value }))}
                  placeholder="Primary diagnosis..."
                  rows={2}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-teal-500 resize-none"
                />
              </div>

              {/* Medications */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Medications</label>
                  <button onClick={addMed} className="flex items-center gap-1 text-xs text-teal-400 hover:text-teal-300">
                    <Plus size={12} /> Add
                  </button>
                </div>
                <div className="space-y-2">
                  {rx.medications.map((med, i) => (
                    <div key={i} className="bg-gray-800 rounded-lg p-2.5 border border-gray-700 space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <input value={med.name} onChange={e => updateMed(i, "name", e.target.value)}
                          placeholder="Medicine name" className="flex-1 bg-gray-900 border border-gray-700 rounded-md px-2 py-1 text-xs text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-teal-500" />
                        {rx.medications.length > 1 && (
                          <button onClick={() => removeMed(i)} className="text-red-500 hover:text-red-400 flex-shrink-0">
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        <input value={med.dosage} onChange={e => updateMed(i, "dosage", e.target.value)}
                          placeholder="Dosage" className="bg-gray-900 border border-gray-700 rounded-md px-2 py-1 text-xs text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-teal-500" />
                        <input value={med.frequency} onChange={e => updateMed(i, "frequency", e.target.value)}
                          placeholder="Freq." className="bg-gray-900 border border-gray-700 rounded-md px-2 py-1 text-xs text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-teal-500" />
                        <input value={med.duration} onChange={e => updateMed(i, "duration", e.target.value)}
                          placeholder="Days" className="bg-gray-900 border border-gray-700 rounded-md px-2 py-1 text-xs text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-teal-500" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructions */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Instructions</label>
                <textarea value={rx.instructions} onChange={e => setRx(r => ({ ...r, instructions: e.target.value }))}
                  placeholder="Take after meals, avoid alcohol..." rows={2}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-teal-500 resize-none" />
              </div>

              {/* Follow-up date */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Follow-up Date</label>
                <input type="date" value={rx.followUpDate} onChange={e => setRx(r => ({ ...r, followUpDate: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                  style={{ colorScheme: "dark" }} />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Additional Notes</label>
                <textarea value={rx.notes} onChange={e => setRx(r => ({ ...r, notes: e.target.value }))}
                  placeholder="Rest, hydration, lifestyle changes..." rows={2}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-teal-500 resize-none" />
              </div>

              {/* Save feedback */}
              {rxSaved && (
                <div className="flex items-center gap-2 bg-green-900/40 text-green-400 rounded-lg px-3 py-2 text-xs border border-green-800/50">
                  <Check size={13} /> Prescription saved & encrypted successfully
                </div>
              )}
              {rxError && (
                <div className="flex items-start gap-2 bg-red-900/40 text-red-400 rounded-lg px-3 py-2 text-xs border border-red-800/50">
                  <AlertCircle size={13} className="mt-0.5 shrink-0" />{rxError}
                </div>
              )}
            </div>
          )}

          {/* Save button — always visible */}
          <div className="px-4 py-3 border-t border-gray-700 flex-shrink-0">
            <button onClick={savePrescription} disabled={rxSaving || !patientEmail}
              className="w-full py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
              {rxSaving
                ? <><Loader2 size={15} className="animate-spin" />Saving…</>
                : <><Save size={15} />Save Prescription</>}
            </button>
            <p className="text-xs text-gray-600 text-center mt-2">
              🔒 Encrypted with AES-256-GCM before storage
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}