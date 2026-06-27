import { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";
import { fetchDoctorProfile } from "../api/api";
import {
  User,
  MessageSquareWarning,
  Languages,
  Bell,
  Shield,
  ChevronRight,
  Camera,
  Pencil,
  Check,
  X,
  Clock,
  Phone,
  Mail,
  Calendar,
  Star,
  Briefcase,
} from "lucide-react";

// ─── Reusable editable field ────────────────────────────────────────────────
function EditableField({ label, value, type = "text", onSave, icon: Icon }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const commit = () => {
    onSave(draft);
    setEditing(false);
  };
  const cancel = () => {
    setDraft(value);
    setEditing(false);
  };

  return (
    <div className="flex items-start gap-3 py-4 border-b border-teal-500/10 last:border-0">
      {Icon && (
        <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center mt-0.5 flex-shrink-0">
          <Icon size={15} className="text-teal-600" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-black/40 mb-1 uppercase tracking-wide">{label}</p>
        {editing ? (
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type={type}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && commit()}
              className="flex-1 border border-teal-400 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-teal-400/40 bg-white"
            />
            <button onClick={commit} className="p-1.5 rounded-lg bg-teal-600 text-white hover:bg-teal-700">
              <Check size={14} />
            </button>
            <button onClick={cancel} className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200">
              <X size={14} />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between group">
            <p className="text-sm text-gray-800 font-medium truncate">{value || "—"}</p>
            <button
              onClick={() => { setDraft(value); setEditing(true); }}
              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-teal-50 text-teal-600 transition-all"
            >
              <Pencil size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Time range editable ─────────────────────────────────────────────────────
function TimeRangeField({ label, from, to, onSave }) {
  const [editing, setEditing] = useState(false);
  const [draftFrom, setDraftFrom] = useState(from);
  const [draftTo, setDraftTo] = useState(to);

  const commit = () => {
    onSave({ from: draftFrom, to: draftTo });
    setEditing(false);
  };

  return (
    <div className="flex items-start gap-3 py-4 border-b border-teal-500/10 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center mt-0.5 flex-shrink-0">
        <Clock size={15} className="text-teal-600" />
      </div>
      <div className="flex-1">
        <p className="text-xs text-black/40 mb-1 uppercase tracking-wide">{label}</p>
        {editing ? (
          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="time"
              value={draftFrom}
              onChange={(e) => setDraftFrom(e.target.value)}
              className="border border-teal-400 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-teal-400/40 bg-white"
            />
            <span className="text-gray-400 text-sm">to</span>
            <input
              type="time"
              value={draftTo}
              onChange={(e) => setDraftTo(e.target.value)}
              className="border border-teal-400 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-teal-400/40 bg-white"
            />
            <button onClick={commit} className="p-1.5 rounded-lg bg-teal-600 text-white hover:bg-teal-700">
              <Check size={14} />
            </button>
            <button onClick={() => setEditing(false)} className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200">
              <X size={14} />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between group">
            <p className="text-sm text-gray-800 font-medium">
              {from && to ? `${from} – ${to}` : "Not set"}
            </p>
            <button
              onClick={() => setEditing(true)}
              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-teal-50 text-teal-600 transition-all"
            >
              <Pencil size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Section wrapper ─────────────────────────────────────────────────────────
function SettingsSection({ title, children }) {
  return (
    <div className="bg-teal-50/40 border border-teal-500/30 rounded-2xl p-6 mb-5">
      <h2 className="text-sm font-semibold text-teal-700 uppercase tracking-wider mb-4">{title}</h2>
      {children}
    </div>
  );
}

// ─── Nav item in left panel ───────────────────────────────────────────────────
function NavItem({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
        active
          ? "bg-teal-600 text-white shadow-sm"
          : "text-gray-600 hover:bg-teal-50"
      }`}
    >
      <Icon size={18} />
      <span className="font-medium">{label}</span>
      <ChevronRight size={14} className={`ml-auto ${active ? "text-white/70" : "text-gray-300"}`} />
    </button>
  );
}

// ─── COMPLAINTS & FEEDBACK ───────────────────────────────────────────────────
function ComplaintsFeedback() {
  const [type, setType] = useState("complaint");
  const [category, setCategory] = useState("Technical Issue");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const categories = ["Technical Issue", "Patient Experience", "Platform Feature", "Billing", "Other"];

  const handleSubmit = () => {
    if (!message.trim()) return;
    // In a real app, call an API here
    setSubmitted(true);
    setTimeout(() => { setSubmitted(false); setMessage(""); }, 3000);
  };

  return (
    <div>
      <h1 className="text-2xl text-black mb-1">Complaints & Feedback</h1>
      <p className="text-sm text-black/50 mb-6">Share your experience or report an issue</p>

      <SettingsSection title="Submit a Report">
        <div className="flex gap-3 mb-5">
          {["complaint", "feedback"].map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`px-4 py-2 rounded-lg text-sm capitalize transition-all ${
                type === t ? "bg-teal-600 text-white" : "bg-teal-50 text-gray-600 hover:bg-teal-100"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="mb-4">
          <label className="text-xs text-black/50 mb-1.5 block uppercase tracking-wide">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border border-teal-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-400/40 bg-white"
          >
            {categories.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>

        <div className="mb-4">
          <label className="text-xs text-black/50 mb-1.5 block uppercase tracking-wide">Description</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            placeholder={type === "complaint" ? "Describe the issue you're facing..." : "Share your thoughts or suggestions..."}
            className="w-full border border-teal-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-400/40 bg-white resize-none"
          />
        </div>

        <button
          onClick={handleSubmit}
          className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${
            submitted
              ? "bg-green-500 text-white"
              : "bg-teal-600 text-white hover:bg-teal-700"
          }`}
        >
          {submitted ? "✓ Submitted Successfully" : "Submit"}
        </button>
      </SettingsSection>

      <SettingsSection title="Previous Submissions">
        <div className="space-y-3">
          {[
            { type: "complaint", category: "Technical Issue", date: "12 Jun 2026", status: "Resolved" },
            { type: "feedback", category: "Platform Feature", date: "3 May 2026", status: "Under Review" },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-teal-500/10 last:border-0">
              <div>
                <p className="text-sm font-medium text-gray-800 capitalize">{item.type} · {item.category}</p>
                <p className="text-xs text-gray-400 mt-0.5">{item.date}</p>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-lg font-medium ${
                item.status === "Resolved" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
              }`}>
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </SettingsSection>
    </div>
  );
}

// ─── LANGUAGE ────────────────────────────────────────────────────────────────
function LanguageSection() {
  const [selected, setSelected] = useState("English");
  const languages = [
    { code: "en", name: "English", native: "English" },
    { code: "hi", name: "Hindi", native: "हिन्दी" },
    { code: "mr", name: "Marathi", native: "मराठी" },
    { code: "gu", name: "Gujarati", native: "ગુજરાતી" },
    { code: "ta", name: "Tamil", native: "தமிழ்" },
    { code: "te", name: "Telugu", native: "తెలుగు" },
    { code: "bn", name: "Bengali", native: "বাংলা" },
    { code: "kn", name: "Kannada", native: "ಕನ್ನಡ" },
  ];

  return (
    <div>
      <h1 className="text-2xl text-black mb-1">Language</h1>
      <p className="text-sm text-black/50 mb-6">Choose your preferred language for the platform</p>

      <SettingsSection title="Select Language">
        <div className="grid grid-cols-2 gap-3">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setSelected(lang.name)}
              className={`flex items-center justify-between px-4 py-3 rounded-xl border text-sm transition-all ${
                selected === lang.name
                  ? "border-teal-500 bg-teal-50 text-teal-700"
                  : "border-teal-500/20 bg-white text-gray-700 hover:border-teal-400"
              }`}
            >
              <div className="text-left">
                <p className="font-medium">{lang.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{lang.native}</p>
              </div>
              {selected === lang.name && (
                <Check size={16} className="text-teal-600 flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
        <button className="mt-5 px-6 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-medium hover:bg-teal-700 transition-all">
          Save Language
        </button>
      </SettingsSection>
    </div>
  );
}

// ─── NOTIFICATIONS SETTINGS ──────────────────────────────────────────────────
function NotificationSettings() {
  const [prefs, setPrefs] = useState({
    newAppointment: true,
    appointmentReminder: true,
    patientMessage: false,
    systemUpdates: true,
    weeklyReport: false,
  });

  const toggle = (key) => setPrefs((p) => ({ ...p, [key]: !p[key] }));

  const items = [
    { key: "newAppointment", label: "New Appointment Booked", desc: "Get notified when a patient books an appointment" },
    { key: "appointmentReminder", label: "Appointment Reminders", desc: "Receive reminders 30 minutes before a consultation" },
    { key: "patientMessage", label: "Patient Messages", desc: "Alerts for messages from patients" },
    { key: "systemUpdates", label: "System Updates", desc: "Platform maintenance and feature announcements" },
    { key: "weeklyReport", label: "Weekly Summary Report", desc: "A digest of your weekly activity and stats" },
  ];

  return (
    <div>
      <h1 className="text-2xl text-black mb-1">Notification Preferences</h1>
      <p className="text-sm text-black/50 mb-6">Control what alerts you receive</p>

      <SettingsSection title="Alerts">
        <div className="space-y-1">
          {items.map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between py-4 border-b border-teal-500/10 last:border-0">
              <div>
                <p className="text-sm font-medium text-gray-800">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
              </div>
              <button
                onClick={() => toggle(key)}
                className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                  prefs[key] ? "bg-teal-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    prefs[key] ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </SettingsSection>
    </div>
  );
}

// ─── SECURITY ────────────────────────────────────────────────────────────────
function SecuritySection() {
  const [showPwForm, setShowPwForm] = useState(false);
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });

  return (
    <div>
      <h1 className="text-2xl text-black mb-1">Security</h1>
      <p className="text-sm text-black/50 mb-6">Manage your account security settings</p>

      <SettingsSection title="Password">
        {!showPwForm ? (
          <button
            onClick={() => setShowPwForm(true)}
            className="flex items-center gap-2 text-teal-600 text-sm font-medium hover:underline"
          >
            <Pencil size={14} /> Change Password
          </button>
        ) : (
          <div className="space-y-3 max-w-sm">
            {[["current", "Current Password"], ["next", "New Password"], ["confirm", "Confirm New Password"]].map(([key, label]) => (
              <div key={key}>
                <label className="text-xs text-black/50 mb-1 block uppercase tracking-wide">{label}</label>
                <input
                  type="password"
                  value={pw[key]}
                  onChange={(e) => setPw((p) => ({ ...p, [key]: e.target.value }))}
                  className="w-full border border-teal-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-400/40 bg-white"
                />
              </div>
            ))}
            <div className="flex gap-2 pt-1">
              <button className="px-5 py-2 bg-teal-600 text-white rounded-xl text-sm font-medium hover:bg-teal-700">Update</button>
              <button onClick={() => setShowPwForm(false)} className="px-5 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm hover:bg-gray-200">Cancel</button>
            </div>
          </div>
        )}
      </SettingsSection>

      <SettingsSection title="Active Sessions">
        {[
          { device: "Chrome · Windows 11", location: "Pune, IN", current: true },
          { device: "Safari · iPhone 15", location: "Pune, IN", current: false },
        ].map((s, i) => (
          <div key={i} className="flex items-center justify-between py-3 border-b border-teal-500/10 last:border-0">
            <div>
              <p className="text-sm font-medium text-gray-800">{s.device}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.location}</p>
            </div>
            {s.current ? (
              <span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded-lg">Current</span>
            ) : (
              <button className="text-xs text-red-500 hover:underline">Revoke</button>
            )}
          </div>
        ))}
      </SettingsSection>
    </div>
  );
}

// ─── PROFILE ─────────────────────────────────────────────────────────────────
function ProfileSection({ doctor, setDoctor }) {
  const fileRef = useRef(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const update = (field) => (val) => setDoctor((d) => ({ ...d, [field]: val }));
  const updateTime = (field) => ({ from, to }) =>
    setDoctor((d) => ({ ...d, [field]: { from, to } }));

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const getInitials = (name = "") => {
    const words = name.split(" ");
    return words.length > 1 ? words[0][0] + words[1][0] : (words[0][0] || "DR");
  };

  return (
    <div>
      <h1 className="text-2xl text-black mb-1">Profile</h1>
      <p className="text-sm text-black/50 mb-6">Manage your personal and professional information</p>

      {/* Photo */}
      <SettingsSection title="Profile Photo">
        <div className="flex items-center gap-5">
          <div className="relative">
            {photoPreview ? (
              <img
                src={photoPreview}
                alt="Profile"
                className="w-24 h-24 rounded-2xl object-cover border-2 border-teal-400"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-teal-600 text-white flex items-center justify-center text-2xl font-semibold border-2 border-teal-400">
                {getInitials(doctor?.name)}
              </div>
            )}
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-white border-2 border-teal-500 flex items-center justify-center text-teal-600 hover:bg-teal-50 shadow"
            >
              <Camera size={14} />
            </button>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">{doctor?.name || "Your Name"}</p>
            <p className="text-xs text-gray-400 mt-0.5">{doctor?.specialization || "Specialization"}</p>
            <button
              onClick={() => fileRef.current?.click()}
              className="mt-2 text-xs text-teal-600 hover:underline"
            >
              Upload new photo
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
        </div>
      </SettingsSection>

      {/* Personal Info */}
      <SettingsSection title="Personal Information">
        <EditableField label="Full Name" value={doctor?.name || ""} onSave={update("name")} icon={User} />
        <EditableField label="Age" value={doctor?.age ? String(doctor.age) : ""} type="number" onSave={(v) => update("age")(Number(v))} icon={Calendar} />
        <EditableField label="Phone Number" value={doctor?.phone || ""} type="tel" onSave={update("phone")} icon={Phone} />
        <EditableField label="Email" value={doctor?.email || ""} type="email" onSave={update("email")} icon={Mail} />
      </SettingsSection>

      {/* Professional Info */}
      <SettingsSection title="Professional Information">
        <EditableField label="Specialization" value={doctor?.specialization || ""} onSave={update("specialization")} icon={Star} />
        <EditableField label="Years of Experience" value={doctor?.experience ? String(doctor.experience) : ""} type="number" onSave={(v) => update("experience")(Number(v))} icon={Briefcase} />
        <EditableField label="Hospital / Clinic Name" value={doctor?.hospital || ""} onSave={update("hospital")} icon={Briefcase} />
        <EditableField label="License Number" value={doctor?.licenseNo || ""} onSave={update("licenseNo")} icon={Shield} />
      </SettingsSection>

      {/* Timings */}
      <SettingsSection title="Availability & Timings">
        <TimeRangeField
          label="Working Hours"
          from={doctor?.workingHours?.from || "09:00"}
          to={doctor?.workingHours?.to || "18:00"}
          onSave={updateTime("workingHours")}
        />
        <TimeRangeField
          label="Break Timings"
          from={doctor?.breakTime?.from || "13:00"}
          to={doctor?.breakTime?.to || "14:00"}
          onSave={updateTime("breakTime")}
        />

        <div className="pt-4">
          <p className="text-xs text-black/40 mb-3 uppercase tracking-wide">Working Days</p>
          <DaysPicker selected={doctor?.workingDays || ["Mon", "Tue", "Wed", "Thu", "Fri"]} onSave={update("workingDays")} />
        </div>
      </SettingsSection>

      <button className="px-8 py-3 bg-teal-600 text-white rounded-xl text-sm font-medium hover:bg-teal-700 transition-all shadow-sm">
        Save All Changes
      </button>
    </div>
  );
}

function DaysPicker({ selected, onSave }) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const [active, setActive] = useState(selected);

  const toggle = (day) => {
    const next = active.includes(day) ? active.filter((d) => d !== day) : [...active, day];
    setActive(next);
    onSave(next);
  };

  return (
    <div className="flex gap-2 flex-wrap">
      {days.map((d) => (
        <button
          key={d}
          onClick={() => toggle(d)}
          className={`w-11 h-10 rounded-lg text-xs font-medium transition-all ${
            active.includes(d) ? "bg-teal-600 text-white" : "bg-teal-50 text-gray-500 hover:bg-teal-100"
          }`}
        >
          {d}
        </button>
      ))}
    </div>
  );
}

// ─── MAIN SETTINGS PAGE ───────────────────────────────────────────────────────
const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "complaints", label: "Complaints & Feedback", icon: MessageSquareWarning },
  { id: "language", label: "Language", icon: Languages },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
];

export default function Settings() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [doctor, setDoctor] = useState(null);

  useEffect(() => {
    fetchDoctorProfile()
      .then(setDoctor)
      .catch(() => {
        // fallback demo data
        setDoctor({
          name: "Dr. Aisha Sharma",
          specialization: "General Physician",
          age: 36,
          phone: "+91 9876543210",
          email: "aisha.sharma@clinic.in",
          experience: 10,
          hospital: "City Medical Centre",
          licenseNo: "MH-2024-09871",
          workingHours: { from: "09:00", to: "18:00" },
          breakTime: { from: "13:00", to: "14:00" },
          workingDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
        });
      });
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case "profile": return <ProfileSection doctor={doctor} setDoctor={setDoctor} />;
      case "complaints": return <ComplaintsFeedback />;
      case "language": return <LanguageSection />;
      case "notifications": return <NotificationSettings />;
      case "security": return <SecuritySection />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 relative">
      <Sidebar doctor={doctor} isExpanded={isExpanded} setIsExpanded={setIsExpanded} />

      <div className={`transition-all duration-300 ${isExpanded ? "ml-64" : "ml-20"} p-8 karla-font`}>
        <div className="mb-6">
          <h1 className="text-2xl text-black">Settings</h1>
          <p className="text-sm text-black/60 mt-1">Manage your account, preferences and security</p>
        </div>

        <div className="flex gap-6 items-start">
          {/* Left nav */}
          <div className="w-56 flex-shrink-0 bg-teal-50/40 border border-teal-500/30 rounded-2xl p-3 space-y-1 sticky top-8">
            {TABS.map((tab) => (
              <NavItem
                key={tab.id}
                icon={tab.icon}
                label={tab.label}
                active={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
              />
            ))}
          </div>

          {/* Right content */}
          <div className="flex-1 min-w-0">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
