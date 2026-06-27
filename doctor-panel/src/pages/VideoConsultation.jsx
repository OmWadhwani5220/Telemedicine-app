import { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";
import { fetchDoctorProfile, fetchDoctorPatients } from "../api/api";
import {
  Video, VideoOff, Mic, MicOff, PhoneOff, Monitor, MonitorOff,
  MessageSquare, ChevronDown, Save, FileText, User, Clock,
  Maximize2, MoreHorizontal, Volume2, VolumeX, Download,
  CheckCircle, Search, X,
} from "lucide-react";

// ─── Control button ────────────────────────────────────────────────────────
function CtrlBtn({ icon: Icon, offIcon: OffIcon, active, label, danger, onClick, disabled }) {
  const Ico = active ? (OffIcon || Icon) : Icon;
  return (
    <div className="flex flex-col items-center gap-1.5">
      <button
        onClick={onClick}
        disabled={disabled}
        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-md
          ${danger
            ? "bg-red-500 hover:bg-red-600 text-white"
            : active
              ? "bg-white/20 hover:bg-white/30 text-white border border-white/20"
              : "bg-white/10 hover:bg-white/20 text-white/50 border border-white/10"
          }
          ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
      >
        <Ico size={20} strokeWidth={2} />
      </button>
      <span className="text-[10px] text-white/60 whitespace-nowrap">{label}</span>
    </div>
  );
}

// ─── Timer ────────────────────────────────────────────────────────────────
function CallTimer({ running }) {
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [running]);
  const h = Math.floor(secs / 3600).toString().padStart(2, "0");
  const m = Math.floor((secs % 3600) / 60).toString().padStart(2, "0");
  const s = (secs % 60).toString().padStart(2, "0");
  return <span className="font-mono text-white/80 text-sm">{h}:{m}:{s}</span>;
}

// ─── MAIN VIDEO CONSULTATION PAGE ─────────────────────────────────────────
export default function VideoConsultation() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [doctor, setDoctor] = useState(null);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientSearch, setPatientSearch] = useState("");
  const [showPatientPicker, setShowPatientPicker] = useState(false);

  // Call state
  const [callActive, setCallActive] = useState(false);
  const [videoOn, setVideoOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [screenShare, setScreenShare] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(true);
  const [callEnded, setCallEnded] = useState(false);

  // Notes
  const [notes, setNotes] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [prescription, setPrescription] = useState("");
  const [followUp, setFollowUp] = useState("");
  const [notesSaved, setNotesSaved] = useState(false);
  const [activeNoteTab, setActiveNoteTab] = useState("notes");

  const localVideoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    fetchDoctorProfile().then(setDoctor).catch(() =>
      setDoctor({ name: "Dr. Aisha Sharma", specialization: "General Physician" })
    );
    fetchDoctorPatients().then(setPatients).catch(() =>
      setPatients([
        { patientId: 1, name: "Rahul Mehta", patientDisplayId: "PT-001", age: 34, gender: "Male" },
        { patientId: 2, name: "Priya Nair", patientDisplayId: "PT-002", age: 28, gender: "Female" },
        { patientId: 3, name: "Suresh Kumar", patientDisplayId: "PT-003", age: 52, gender: "Male" },
      ])
    );
  }, []);

  const filteredPatients = patients.filter((p) =>
    p.name?.toLowerCase().includes(patientSearch.toLowerCase()) ||
    p.patientDisplayId?.toLowerCase().includes(patientSearch.toLowerCase())
  );

  const startCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    } catch {
      // camera not available in demo — continue anyway
    }
    setCallActive(true);
    setCallEnded(false);
    setNotes("");
    setDiagnosis("");
    setPrescription("");
    setFollowUp("");
  };

  const endCall = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCallActive(false);
    setCallEnded(true);
  };

  const toggleVideo = async () => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach((t) => { t.enabled = !videoOn; });
    }
    setVideoOn((v) => !v);
  };

  const toggleMic = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach((t) => { t.enabled = !micOn; });
    }
    setMicOn((v) => !v);
  };

  const saveRecord = () => {
    // In a real app, call apiFetch to save to patient's record
    const record = {
      patientId: selectedPatient?.patientId,
      patientName: selectedPatient?.name,
      date: new Date().toLocaleDateString("en-IN"),
      doctor: doctor?.name,
      notes,
      diagnosis,
      prescription,
      followUp,
    };
    // Persist to localStorage so Patients page can show it in Medical Records
    try {
      const existing = JSON.parse(localStorage.getItem("consultation_records") || "[]");
      existing.push(record);
      localStorage.setItem("consultation_records", JSON.stringify(existing));
    } catch { /* ignore storage errors */ }

    const blob = new Blob([JSON.stringify(record, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `consultation_${selectedPatient?.patientDisplayId || "record"}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 3000);
  };

  const downloadTxt = () => {
    const content = [
      `CONSULTATION RECORD`,
      `===================`,
      `Patient: ${selectedPatient?.name || "—"} (${selectedPatient?.patientDisplayId || "—"})`,
      `Doctor: ${doctor?.name || "—"}`,
      `Date: ${new Date().toLocaleDateString("en-IN")}`,
      ``,
      `NOTES`,
      notes || "None",
      ``,
      `DIAGNOSIS`,
      diagnosis || "None",
      ``,
      `PRESCRIPTION`,
      prescription || "None",
      ``,
      `FOLLOW-UP`,
      followUp || "None",
    ].join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `consultation_${selectedPatient?.patientDisplayId || "record"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-100 relative">
      <Sidebar doctor={doctor} isExpanded={isExpanded} setIsExpanded={setIsExpanded} />

      <div className={`transition-all duration-300 ${isExpanded ? "ml-64" : "ml-20"} p-8 karla-font`}>
        <div className="mb-6">
          <h1 className="text-2xl text-black">Video Consultation</h1>
          <p className="text-sm text-black/60 mt-1">Conduct secure video calls with patients and record on-call notes</p>
        </div>

        {/* Patient selector */}
        {!callActive && !callEnded && (
          <div className="bg-teal-50/40 border border-teal-500/30 rounded-2xl p-5 mb-6">
            <p className="text-sm font-semibold text-teal-700 uppercase tracking-wider mb-3">Select Patient for Consultation</p>
            <div className="relative">
              <button
                onClick={() => setShowPatientPicker((v) => !v)}
                className="flex items-center justify-between w-full max-w-sm border border-teal-300 rounded-xl px-4 py-3 bg-white text-sm hover:border-teal-500 transition-all"
              >
                <span className={selectedPatient ? "text-gray-800 font-medium" : "text-gray-400"}>
                  {selectedPatient ? `${selectedPatient.name} · ${selectedPatient.patientDisplayId}` : "Search or pick a patient..."}
                </span>
                <ChevronDown size={16} className="text-gray-400" />
              </button>

              {showPatientPicker && (
                <div className="absolute top-full left-0 mt-1 w-full max-w-sm bg-white border border-teal-300 rounded-xl shadow-xl z-20 overflow-hidden">
                  <div className="p-2 border-b border-gray-100">
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        autoFocus
                        type="text"
                        value={patientSearch}
                        onChange={(e) => setPatientSearch(e.target.value)}
                        placeholder="Search patients..."
                        className="w-full pl-8 pr-3 py-2 text-sm outline-none"
                      />
                    </div>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {filteredPatients.length === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-4">No patients found</p>
                    ) : (
                      filteredPatients.map((p) => (
                        <button
                          key={p.patientId}
                          onClick={() => { setSelectedPatient(p); setShowPatientPicker(false); setPatientSearch(""); }}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-teal-50 text-left transition-all border-b border-gray-50 last:border-0"
                        >
                          <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 text-xs font-semibold flex-shrink-0">
                            {p.name?.[0] || "P"}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">{p.name}</p>
                            <p className="text-xs text-gray-400">{p.patientDisplayId} · {p.age} yrs · {p.gender}</p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {selectedPatient && (
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center font-semibold text-sm">
                    {selectedPatient.name?.[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{selectedPatient.name}</p>
                    <p className="text-xs text-gray-400">{selectedPatient.patientDisplayId} · {selectedPatient.age} yrs</p>
                  </div>
                </div>
                <button
                  onClick={startCall}
                  className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-medium hover:bg-teal-700 transition-all shadow-sm"
                >
                  <Video size={16} /> Start Consultation
                </button>
              </div>
            )}

            {!selectedPatient && (
              <button
                onClick={startCall}
                className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-medium hover:bg-teal-700 transition-all shadow-sm"
              >
                <Video size={16} /> Start Without Patient Selection
              </button>
            )}
          </div>
        )}

        {/* ── CALL UI ─────────────────────────────────────────────────── */}
        {(callActive || callEnded) && (
          <div className="flex gap-5 items-start">
            {/* ── Left: Video + controls ─────────────────────────────── */}
            <div className="flex-1 min-w-0">
              {/* Video area */}
              <div className="relative bg-gray-900 rounded-2xl overflow-hidden" style={{ aspectRatio: "16/9" }}>
                {/* Remote video placeholder */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {callActive ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-24 h-24 rounded-full bg-teal-700/50 border-2 border-teal-400/40 flex items-center justify-center text-4xl font-semibold text-white/80">
                        {selectedPatient?.name?.[0] || "P"}
                      </div>
                      <p className="text-white/70 text-sm">{selectedPatient?.name || "Patient"}</p>
                      <div className="flex gap-1 mt-1">
                        {[0, 1, 2].map((i) => (
                          <div
                            key={i}
                            className="w-2 h-2 rounded-full bg-teal-400 animate-bounce"
                            style={{ animationDelay: `${i * 0.15}s` }}
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-white/40">
                      <PhoneOff size={40} />
                      <p className="text-sm">Call ended</p>
                    </div>
                  )}
                </div>

                {/* Local video (PiP) */}
                {callActive && videoOn && (
                  <div className="absolute bottom-4 right-4 w-32 aspect-video bg-gray-800 rounded-xl overflow-hidden border-2 border-teal-500/30 shadow-lg">
                    <video
                      ref={localVideoRef}
                      autoPlay
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <p className="text-white/40 text-xs">You</p>
                    </div>
                  </div>
                )}

                {callActive && !videoOn && (
                  <div className="absolute bottom-4 right-4 w-32 aspect-video bg-gray-700 rounded-xl border-2 border-gray-600 shadow-lg flex items-center justify-center">
                    <div className="flex flex-col items-center gap-1">
                      <VideoOff size={16} className="text-white/40" />
                      <p className="text-white/40 text-[10px]">Camera off</p>
                    </div>
                  </div>
                )}

                {/* Status bar */}
                <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/50 to-transparent">
                  <div className="flex items-center gap-2">
                    {callActive && (
                      <>
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-xs text-white/80 font-medium">LIVE</span>
                      </>
                    )}
                    <span className="text-xs text-white/50 ml-2">{selectedPatient?.name || "Patient"}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CallTimer running={callActive} />
                    <button className="text-white/60 hover:text-white"><Maximize2 size={16} /></button>
                    <button className="text-white/60 hover:text-white"><MoreHorizontal size={16} /></button>
                  </div>
                </div>
              </div>

              {/* Controls bar */}
              <div className="mt-3 bg-gray-900 rounded-2xl px-6 py-4 flex items-center justify-center gap-6">
                <CtrlBtn icon={Mic} offIcon={MicOff} active={micOn} label={micOn ? "Mute" : "Unmuted"} onClick={toggleMic} disabled={!callActive} />
                <CtrlBtn icon={Video} offIcon={VideoOff} active={videoOn} label={videoOn ? "Cam Off" : "Cam On"} onClick={toggleVideo} disabled={!callActive} />
                <CtrlBtn icon={Monitor} offIcon={MonitorOff} active={screenShare} label={screenShare ? "Stop Share" : "Share"} onClick={() => setScreenShare((v) => !v)} disabled={!callActive} />
                <CtrlBtn icon={Volume2} offIcon={VolumeX} active={speakerOn} label={speakerOn ? "Mute Spkr" : "Speaker"} onClick={() => setSpeakerOn((v) => !v)} disabled={!callActive} />

                <div className="w-px h-10 bg-white/10 mx-1" />

                {callActive ? (
                  <CtrlBtn icon={PhoneOff} active={true} label="End Call" danger onClick={endCall} />
                ) : (
                  <button
                    onClick={startCall}
                    className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-full text-sm font-medium hover:bg-teal-700 transition-all"
                  >
                    <Video size={16} /> Reconnect
                  </button>
                )}
              </div>

              {/* Patient info strip */}
              {selectedPatient && (
                <div className="mt-3 bg-teal-50/40 border border-teal-500/20 rounded-xl px-4 py-3 flex items-center gap-4">
                  <User size={15} className="text-teal-600 flex-shrink-0" />
                  <div className="flex gap-6 text-sm">
                    <span><span className="text-gray-400 text-xs">Patient </span><span className="font-medium text-gray-700">{selectedPatient.name}</span></span>
                    <span><span className="text-gray-400 text-xs">ID </span><span className="font-medium text-gray-700">{selectedPatient.patientDisplayId}</span></span>
                    <span><span className="text-gray-400 text-xs">Age </span><span className="font-medium text-gray-700">{selectedPatient.age} yrs</span></span>
                    <span><span className="text-gray-400 text-xs">Gender </span><span className="font-medium text-gray-700">{selectedPatient.gender}</span></span>
                  </div>
                </div>
              )}
            </div>

            {/* ── Right: Notes panel ─────────────────────────────────── */}
            <div className="w-80 flex-shrink-0 flex flex-col gap-3">
              {/* Tab bar */}
              <div className="bg-teal-50/40 border border-teal-500/30 rounded-2xl overflow-hidden">
                <div className="flex border-b border-teal-500/20">
                  {[
                    { id: "notes", label: "Notes", icon: FileText },
                    { id: "diagnosis", label: "Diagnosis", icon: MessageSquare },
                  ].map(({ id, label, icon: Ico }) => (
                    <button
                      key={id}
                      onClick={() => setActiveNoteTab(id)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-all ${
                        activeNoteTab === id
                          ? "bg-teal-600 text-white"
                          : "text-gray-500 hover:text-teal-700 hover:bg-teal-50"
                      }`}
                    >
                      <Ico size={13} /> {label}
                    </button>
                  ))}
                </div>

                <div className="p-4">
                  {activeNoteTab === "notes" && (
                    <div>
                      <label className="text-xs text-black/40 uppercase tracking-wide mb-2 block">On-call Notes</label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={10}
                        placeholder="Record symptoms, observations, patient complaints, vitals..."
                        className="w-full border border-teal-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-400/40 bg-white resize-none"
                      />
                    </div>
                  )}

                  {activeNoteTab === "diagnosis" && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs text-black/40 uppercase tracking-wide mb-1.5 block">Diagnosis</label>
                        <textarea
                          value={diagnosis}
                          onChange={(e) => setDiagnosis(e.target.value)}
                          rows={3}
                          placeholder="Primary diagnosis..."
                          className="w-full border border-teal-300 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-400/40 bg-white resize-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-black/40 uppercase tracking-wide mb-1.5 block">Prescription</label>
                        <textarea
                          value={prescription}
                          onChange={(e) => setPrescription(e.target.value)}
                          rows={3}
                          placeholder="Medications and dosage..."
                          className="w-full border border-teal-300 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-400/40 bg-white resize-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-black/40 uppercase tracking-wide mb-1.5 block">Follow-up</label>
                        <input
                          type="date"
                          value={followUp}
                          onChange={(e) => setFollowUp(e.target.value)}
                          className="w-full border border-teal-300 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-400/40 bg-white"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Save actions */}
              <div className="bg-teal-50/40 border border-teal-500/30 rounded-2xl p-4 space-y-2">
                <p className="text-xs text-black/40 uppercase tracking-wide mb-3">Save Record</p>

                <button
                  onClick={saveRecord}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    notesSaved
                      ? "bg-green-500 text-white"
                      : "bg-teal-600 text-white hover:bg-teal-700"
                  }`}
                >
                  {notesSaved ? <CheckCircle size={15} /> : <Save size={15} />}
                  {notesSaved ? "Saved to Records" : "Save to Patient Record"}
                </button>

                <button
                  onClick={downloadTxt}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border border-teal-300 text-teal-700 hover:bg-teal-50 transition-all"
                >
                  <Download size={15} /> Download as Text
                </button>
              </div>

              {/* Quick timestamp note */}
              {callActive && (
                <div className="bg-teal-50/40 border border-teal-500/20 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock size={13} className="text-teal-600" />
                    <p className="text-xs font-medium text-gray-600">Quick Timestamp Note</p>
                  </div>
                  <QuickNote onAdd={(txt) => setNotes((n) => n + (n ? "\n" : "") + `[${new Date().toLocaleTimeString("en-IN")}] ${txt}`)} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Post-call summary */}
        {callEnded && (
          <div className="mt-5 bg-teal-50/40 border border-teal-500/30 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle size={18} className="text-teal-600" />
              <h3 className="text-sm font-semibold text-teal-700">Consultation Ended</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Notes captured</p>
                <p className="font-medium text-gray-700">{notes ? `${notes.length} characters` : "None"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Diagnosis</p>
                <p className="font-medium text-gray-700">{diagnosis || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Prescription</p>
                <p className="font-medium text-gray-700">{prescription || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Follow-up</p>
                <p className="font-medium text-gray-700">{followUp || "Not set"}</p>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={saveRecord}
                className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-medium hover:bg-teal-700"
              >
                <Save size={14} /> Save to Patient Record
              </button>
              <button
                onClick={downloadTxt}
                className="flex items-center gap-2 px-4 py-2.5 border border-teal-300 text-teal-700 rounded-xl text-sm hover:bg-teal-50"
              >
                <Download size={14} /> Download Summary
              </button>
              <button
                onClick={() => { setCallEnded(false); setSelectedPatient(null); }}
                className="ml-auto flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50"
              >
                <X size={14} /> New Consultation
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Quick timestamp note input ──────────────────────────────────────────
function QuickNote({ onAdd }) {
  const [val, setVal] = useState("");
  const submit = () => {
    if (!val.trim()) return;
    onAdd(val.trim());
    setVal("");
  };
  return (
    <div className="flex gap-1.5">
      <input
        type="text"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        placeholder="Type and press Enter..."
        className="flex-1 border border-teal-300 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:ring-2 focus:ring-teal-400/40 bg-white"
      />
      <button
        onClick={submit}
        className="px-2.5 py-1.5 bg-teal-600 text-white rounded-lg text-xs hover:bg-teal-700"
      >
        +
      </button>
    </div>
  );
}
