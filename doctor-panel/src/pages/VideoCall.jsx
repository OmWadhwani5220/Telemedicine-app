import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Copy,
  Mail,
  Users,
  Check,
  Loader2,
} from "lucide-react";

const SIGNALING_URL = import.meta.env.VITE_SIGNALING_URL || "http://localhost:5000";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";
const ICE_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" },
  {
    urls: "turn:relay1.expressturn.com:3478",
    username: "ef2Z7F1ZKX6Z4Z7U",
    credential: "E4c3R9W8",
  },
];

// Generate a random room ID
const generateRoomId = () =>
  Math.random().toString(36).substring(2, 8).toUpperCase();
// Generate a simple password
const generatePassword = () =>
  Math.random().toString(36).substring(2, 10);

export default function VideoCall() {
  const [step, setStep] = useState("setup"); // setup | calling | incall
  const [roomId, setRoomId] = useState("");
  const [password, setPassword] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [patientName, setPatientName] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [copied, setCopied] = useState(false);
  const [joined, setJoined] = useState(false);
  const [peerConnected, setPeerConnected] = useState(false);
  const [audioOnly, setAudioOnly] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [error, setError] = useState("");

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const socketRef = useRef(null);
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const timerRef = useRef(null);

  // Generate meeting credentials on mount
  useEffect(() => {
    setRoomId(generateRoomId());
    setPassword(generatePassword());
  }, []);

  // Call duration timer
  useEffect(() => {
    if (peerConnected) {
      timerRef.current = setInterval(() => setCallDuration((d) => d + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [peerConnected]);

  const formatDuration = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const cleanup = () => {
    clearInterval(timerRef.current);
    try { socketRef.current?.disconnect(); } catch { }
    socketRef.current = null;
    try { pcRef.current?.close(); } catch { }
    pcRef.current = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    if (localStreamRef.current)
      localStreamRef.current.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
  };

  const startMeeting = async () => {
    setError("");
    try {
      const socket = io(SIGNALING_URL, { transports: ["websocket"] });
      socketRef.current = socket;

      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
      pcRef.current = pc;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: !audioOnly,
        audio: true,
      });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      pc.ontrack = (event) => {
        console.log("🎥 Track received:", event.streams);
        if (remoteVideoRef.current)
          remoteVideoRef.current.srcObject = event.streams[0];
        setPeerConnected(true);
      };

      pc.onicecandidate = (event) => {
        if (event.candidate)
          socket.emit("ice", {
            roomId: roomId.toUpperCase(),
            candidate: event.candidate,
          });
      };
      pc.onconnectionstatechange = () => {
  console.log("🧠 Connection state:", pc.connectionState);
};

pc.oniceconnectionstatechange = () => {
  console.log("🧊 ICE state:", pc.iceConnectionState);
};

      // Doctor is the "host" — when patient joins, doctor creates offer
      socket.on("peer", async ({ peerId }) => {
        console.log("👤 Peer joined:", peerId);

        // Only create offer if not already connected
        if (!pc.currentRemoteDescription) {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit("offer", { to: peerId, offer });
        }
      });

      socket.on("offer", async ({ from, offer }) => {
        await pc.setRemoteDescription(offer);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("answer", { to: from, answer });
      });

      socket.on("answer", async ({ answer }) => {
        await pc.setRemoteDescription(answer);
      });

      socket.on("ice", async ({ candidate }) => {
        try { await pc.addIceCandidate(candidate); } catch { }
      });

      socket.on("peer-left", () => {
        setPeerConnected(false);
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
      });

      socket.emit("join", { roomId: roomId.toUpperCase() });
      setJoined(true);
      setStep("incall");
    } catch (err) {
      setError("Could not access camera/microphone. Please check permissions.");
      console.error(err);
    }
  };

  const endCall = () => {
    socketRef.current?.emit("leave", { roomId });
    cleanup();
    setJoined(false);
    setPeerConnected(false);
    setCallDuration(0);
    setStep("setup");
    setEmailSent(false);
  };

  const toggleMic = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((t) => {
        t.enabled = !t.enabled;
      });
      setMicOn((v) => !v);
    }
  };

  const toggleCam = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((t) => {
        t.enabled = !t.enabled;
      });
      setCamOn((v) => !v);
    }
  };

  const sendMeetingEmail = async () => {
    if (!patientEmail) { setError("Please enter patient email."); return; }
    setSendingEmail(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BACKEND_URL}/api/meetings/send-invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          patientEmail,
          patientName: patientName || "Patient",
          roomId,
          password,
          doctorName: localStorage.getItem("name") || "Doctor",
        }),
      });
      if (!res.ok) throw new Error("Failed to send email");
      setEmailSent(true);
    } catch (err) {
      setError("Failed to send email. Check your email configuration.");
    } finally {
      setSendingEmail(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => () => cleanup(), []);

  // ─── SETUP SCREEN ────────────────────────────────────────────────────────────
  if (step === "setup") {
    return (
      <div className="min-h-screen bg-slate-100 p-8 karla-font">
        <div className="mb-6">
          <h1 className="text-2xl text-black">Video Consultation</h1>
          <p className="text-sm text-black/60 mt-1">Create a meeting and invite your patient</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Meeting Credentials Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-teal-500/20 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-1 flex items-center gap-2">
              <Video size={20} className="text-teal-600" />
              Meeting Details
            </h2>
            <p className="text-sm text-gray-500 mb-5">
              Share these credentials with your patient.
            </p>

            <div className="space-y-4">
              <div className="bg-teal-50 rounded-xl p-4">
                <p className="text-xs text-teal-600 font-medium mb-1">MEETING ID</p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold tracking-widest text-gray-800">{roomId}</span>
                  <button
                    onClick={() => copyToClipboard(`Meeting ID: ${roomId}  Password: ${password}`)}
                    className="flex items-center gap-1 text-teal-600 hover:text-teal-800 text-sm"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>

              <div className="bg-teal-50 rounded-xl p-4">
                <p className="text-xs text-teal-600 font-medium mb-1">PASSWORD</p>
                <span className="text-xl font-bold tracking-widest text-gray-800">{password}</span>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={audioOnly}
                    onChange={(e) => setAudioOnly(e.target.checked)}
                    className="w-4 h-4 accent-teal-600"
                  />
                  Audio only mode
                </label>
              </div>

              {error && (
                <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
              )}

              <button
                onClick={startMeeting}
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-all"
              >
                <Video size={18} />
                Start Meeting Room
              </button>
            </div>
          </div>

          {/* Email Invite Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-teal-500/20 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-1 flex items-center gap-2">
              <Mail size={20} className="text-teal-600" />
              Invite Patient via Email
            </h2>
            <p className="text-sm text-gray-500 mb-5">
              Send meeting ID &amp; password directly to patient's inbox.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patient Name
                </label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="e.g. Riya Sharma"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patient Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={patientEmail}
                  onChange={(e) => setPatientEmail(e.target.value)}
                  placeholder="patient@example.com"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>

              {emailSent && (
                <div className="flex items-center gap-2 bg-green-50 text-green-700 rounded-xl px-4 py-3 text-sm">
                  <Check size={16} />
                  Email sent successfully to {patientEmail}!
                </div>
              )}

              <button
                onClick={sendMeetingEmail}
                disabled={sendingEmail || !patientEmail}
                className="w-full py-3 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-xl font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-teal-200"
              >
                {sendingEmail ? (
                  <><Loader2 size={18} className="animate-spin" /> Sending...</>
                ) : (
                  <><Mail size={18} /> Send Invite Email</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── IN-CALL SCREEN ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Top Bar */}
      <header className="bg-gray-800 px-6 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-white font-medium">Video Consultation</h1>
          <p className="text-gray-400 text-xs">Room: {roomId}</p>
        </div>
        <div className="flex items-center gap-3">
          {peerConnected ? (
            <span className="flex items-center gap-2 bg-green-900/50 text-green-400 text-xs px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Patient connected · {formatDuration(callDuration)}
            </span>
          ) : (
            <span className="flex items-center gap-2 bg-yellow-900/50 text-yellow-400 text-xs px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
              Waiting for patient…
            </span>
          )}
          <div className="flex items-center gap-1 bg-gray-700 text-gray-300 text-xs px-3 py-1.5 rounded-full">
            <Users size={12} />
            {peerConnected ? "2" : "1"} / 2
          </div>
        </div>
      </header>

      {/* Video Area */}
      <div className="flex-1 relative bg-gray-900 flex items-center justify-center">
        {/* Remote Video */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
          style={{ maxHeight: "calc(100vh - 130px)" }}
        />
        <video
  ref={localVideoRef}
  autoPlay
  muted
  playsInline
/>
        {!peerConnected && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 bg-teal-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users size={40} className="text-teal-400" />
              </div>
              <p className="text-white text-lg font-medium">Waiting for patient to join</p>
              <p className="text-gray-400 text-sm mt-1">
                Room ID: <span className="text-teal-400 font-mono font-bold">{roomId}</span>
              </p>
            </div>
          </div>
        )}

        {/* Local PiP */}
        <div className="absolute bottom-4 right-4 w-48 h-36 bg-gray-800 rounded-xl overflow-hidden border border-gray-600 shadow-lg">
          <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
          <span className="absolute bottom-2 left-2 text-white text-xs bg-black/60 px-2 py-0.5 rounded">You</span>
        </div>
      </div>

      {/* Controls */}
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

        <button
          onClick={endCall}
          className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition-all"
        >
          <PhoneOff size={20} />
        </button>
      </div>
    </div>
  );
}
