import { useEffect, useRef, useState } from "react";
import Sidebar from "../components/Sidebar";
import { fetchDoctorProfile } from "../api/api";

import {
  User,
  MessageSquareWarning,
  Languages,
  Bell,
  Shield,
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
  Lock,
  Monitor,
  Smartphone,
  ChevronRight,
} from "lucide-react";


function Section({ title, subtitle, icon: Icon, children }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm mb-5 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
          <Icon size={17} className="text-slate-600" />
        </div>

        <div>
          <h2 className="text-sm font-semibold text-slate-800">
            {title}
          </h2>

          {subtitle && (
            <p className="text-xs text-slate-400 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="px-5">
        {children}
      </div>
    </div>
  );
}


function EditableField({ label, value, icon: Icon, onSave, type = "text" }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || "");

  const startEditing = () => {
    setDraft(value || "");
    setEditing(true);
  };

  const save = () => {
    onSave(draft);
    setEditing(false);
  };

  const cancel = () => {
    setDraft(value || "");
    setEditing(false);
  };

  return (
    <div className="py-4 border-b border-slate-100 last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
          <Icon size={15} className="text-slate-500" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-wide font-semibold text-slate-400">
            {label}
          </p>

          {!editing ? (
            <div className="flex items-center justify-between gap-3 mt-1">
              <p className="text-sm font-medium text-slate-700 truncate">
                {value || "Not provided"}
              </p>

              <button
                type="button"
                onClick={startEditing}
                className="p-1.5 rounded-md text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition"
              >
                <Pencil size={13} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 mt-1">
              <input
                type={type}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="flex-1 h-9 px-3 rounded-lg border border-slate-200 text-sm outline-none focus:border-teal-400"
              />

              <button
                type="button"
                onClick={save}
                className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center"
              >
                <Check size={14} />
              </button>

              <button
                type="button"
                onClick={cancel}
                className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


function TimeField({ label, from, to, onSave }) {
  const [editing, setEditing] = useState(false);
  const [start, setStart] = useState(from);
  const [end, setEnd] = useState(to);

  const save = () => {
    onSave({ from: start, to: end });
    setEditing(false);
  };

  return (
    <div className="py-4 border-b border-slate-100 last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
          <Clock size={15} className="text-slate-500" />
        </div>

        <div className="flex-1">
          <p className="text-[10px] uppercase tracking-wide font-semibold text-slate-400">
            {label}
          </p>

          {!editing ? (
            <div className="flex items-center justify-between mt-1">
              <p className="text-sm font-medium text-slate-700">
                {from && to ? `${from} – ${to}` : "Not set"}
              </p>

              <button
                type="button"
                onClick={() => setEditing(true)}
                className="p-1.5 rounded-md text-slate-400 hover:text-teal-600 hover:bg-teal-50"
              >
                <Pencil size={13} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 mt-1">
              <input
                type="time"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="h-9 px-2 rounded-lg border border-slate-200 text-sm"
              />

              <span className="text-xs text-slate-400">
                to
              </span>

              <input
                type="time"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="h-9 px-2 rounded-lg border border-slate-200 text-sm"
              />

              <button
                type="button"
                onClick={save}
                className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center"
              >
                <Check size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


function DaysPicker({ selected, onChange }) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="flex flex-wrap gap-2">
      {days.map((day) => {
        const active = selected.includes(day);

        return (
          <button
            type="button"
            key={day}
            onClick={() => {
              if (active) {
                onChange(selected.filter((d) => d !== day));
              } else {
                onChange([...selected, day]);
              }
            }}
            className={`w-11 h-9 rounded-lg text-xs font-semibold border transition ${
              active
                ? "bg-teal-600 text-white border-teal-600"
                : "bg-white text-slate-500 border-slate-200 hover:border-teal-300"
            }`}
          >
            {day}
          </button>
        );
      })}
    </div>
  );
}


function ProfileTab({ doctor, setDoctor }) {
  const fileRef = useRef(null);
  const [photo, setPhoto] = useState(null);

  const update = (field, value) => {
    setDoctor((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const getInitials = (name = "") => {
    const clean = name.replace(/^Dr\.?\s*/i, "").trim();
    const words = clean.split(/\s+/);

    if (words.length >= 2) {
      return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }

    return (words[0]?.[0] || "D").toUpperCase();
  };

  return (
    <div>
      <PageHeading
        eyebrow="Account"
        title="Profile"
        description="Manage your personal and professional information."
      />

      <Section
        title="Profile Photo"
        subtitle="Your profile picture shown across the doctor panel."
        icon={Camera}
      >
        <div className="py-5 flex items-center gap-5">
          <div className="relative">
            {photo ? (
              <img
                src={photo}
                alt="Profile"
                className="w-24 h-24 rounded-2xl object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 text-white flex items-center justify-center text-2xl font-semibold">
                {getInitials(doctor?.name)}
              </div>
            )}

            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-white border border-slate-200 shadow flex items-center justify-center text-slate-500 hover:text-teal-600"
            >
              <Camera size={14} />
            </button>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];

                if (!file) return;

                const reader = new FileReader();

                reader.onload = () => {
                  setPhoto(reader.result);
                };

                reader.readAsDataURL(file);
              }}
            />
          </div>

          <div>
            <h3 className="text-base font-semibold text-slate-800">
              Dr. {doctor?.name?.replace(/^Dr\.?\s*/i, "") || "Doctor"}
            </h3>

            <p className="text-xs text-slate-400 mt-1">
              {doctor?.specialization || "Specialization not provided"}
            </p>

            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="text-xs font-semibold text-teal-600 mt-3"
            >
              Upload new photo
            </button>
          </div>
        </div>
      </Section>

      <Section
        title="Personal Information"
        subtitle="Your registered contact details."
        icon={User}
      >
        <EditableField
          label="Full Name"
          value={doctor?.name}
          onSave={(value) => update("name", value)}
          icon={User}
        />

        <EditableField
          label="Age"
          value={doctor?.age}
          type="number"
          onSave={(value) => update("age", value)}
          icon={Calendar}
        />

        <EditableField
          label="Phone Number"
          value={doctor?.phone}
          onSave={(value) => update("phone", value)}
          icon={Phone}
        />

        <EditableField
          label="Email"
          value={doctor?.email}
          onSave={(value) => update("email", value)}
          icon={Mail}
        />
      </Section>

      <Section
        title="Professional Information"
        subtitle="Your medical profile."
        icon={Briefcase}
      >
        <EditableField
          label="Specialization"
          value={doctor?.specialization}
          onSave={(value) => update("specialization", value)}
          icon={Star}
        />

        <EditableField
          label="Qualification"
          value={doctor?.qualification}
          onSave={(value) => update("qualification", value)}
          icon={Briefcase}
        />

        <EditableField
          label="Years of Experience"
          value={doctor?.experience}
          type="number"
          onSave={(value) => update("experience", value)}
          icon={Clock}
        />
      </Section>

      <Section
        title="Availability"
        subtitle="Manage your consultation timings."
        icon={Clock}
      >
        <TimeField
          label="Working Hours"
          from={doctor?.workingHours?.from || "09:00"}
          to={doctor?.workingHours?.to || "18:00"}
          onSave={(value) => update("workingHours", value)}
        />

        <TimeField
          label="Break Time"
          from={doctor?.breakTime?.from || "13:00"}
          to={doctor?.breakTime?.to || "14:00"}
          onSave={(value) => update("breakTime", value)}
        />

        <div className="py-4">
          <p className="text-[10px] uppercase tracking-wide font-semibold text-slate-400 mb-3">
            Working Days
          </p>

          <DaysPicker
            selected={
              doctor?.workingDays || [
                "Mon",
                "Tue",
                "Wed",
                "Thu",
                "Fri",
              ]
            }
            onChange={(days) => update("workingDays", days)}
          />
        </div>
      </Section>
    </div>
  );
}


function ComplaintsTab() {
  const [type, setType] = useState("complaint");
  const [category, setCategory] = useState("Technical Issue");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const categories = [
    "Technical Issue",
    "Patient Experience",
    "Platform Feature",
    "Billing",
    "Other",
  ];

  const submit = () => {
    if (!message.trim()) return;

    setSubmitted(true);

    setTimeout(() => {
      setSubmitted(false);
      setMessage("");
    }, 2500);
  };

  return (
    <div>
      <PageHeading
        eyebrow="Support"
        title="Complaints & Feedback"
        description="Share your experience or report an issue."
      />

      <Section
        title="Submit a Report"
        subtitle="Send us a complaint or suggestion."
        icon={MessageSquareWarning}
      >
        <div className="py-5">
          <div className="flex gap-2 mb-5">
            {["complaint", "feedback"].map((item) => (
              <button
                type="button"
                key={item}
                onClick={() => setType(item)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold capitalize border ${
                  type === item
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-500 border-slate-200"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <label className="block text-[10px] uppercase tracking-wide font-semibold text-slate-400 mb-2">
            Category
          </label>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm mb-4 outline-none"
          >
            {categories.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>

          <label className="block text-[10px] uppercase tracking-wide font-semibold text-slate-400 mb-2">
            Description
          </label>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            placeholder={
              type === "complaint"
                ? "Describe the issue you're facing..."
                : "Share your thoughts or suggestions..."
            }
            className="w-full p-3 rounded-lg border border-slate-200 text-sm outline-none resize-none"
          />

          <button
            type="button"
            onClick={submit}
            className={`mt-4 px-5 h-10 rounded-lg text-xs font-semibold text-white ${
              submitted ? "bg-emerald-500" : "bg-teal-600"
            }`}
          >
            {submitted ? "Submitted Successfully" : "Submit"}
          </button>
        </div>
      </Section>
    </div>
  );
}


function LanguageTab() {
  const [selected, setSelected] = useState("English");

  const languages = [
    ["English", "English"],
    ["Hindi", "हिन्दी"],
    ["Marathi", "मराठी"],
    ["Gujarati", "ગુજરાતી"],
    ["Tamil", "தமிழ்"],
    ["Telugu", "తెలుగు"],
    ["Bengali", "বাংলা"],
    ["Kannada", "ಕನ್ನಡ"],
  ];

  return (
    <div>
      <PageHeading
        eyebrow="Preferences"
        title="Language"
        description="Choose your preferred language."
      />

      <Section
        title="Select Language"
        subtitle="Choose how the platform should be displayed."
        icon={Languages}
      >
        <div className="py-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {languages.map(([name, native]) => {
            const active = selected === name;

            return (
              <button
                type="button"
                key={name}
                onClick={() => setSelected(name)}
                className={`flex items-center justify-between p-4 rounded-xl border text-left ${
                  active
                    ? "border-teal-300 bg-teal-50"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    {name}
                  </p>

                  <p className="text-xs text-slate-400 mt-1">
                    {native}
                  </p>
                </div>

                {active && (
                  <Check size={16} className="text-teal-600" />
                )}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          className="mb-5 px-5 h-9 rounded-lg bg-teal-600 text-white text-xs font-semibold"
        >
          Save Language
        </button>
      </Section>
    </div>
  );
}


function NotificationsTab() {
  const [prefs, setPrefs] = useState({
    newAppointment: true,
    appointmentReminder: true,
    patientMessage: false,
    systemUpdates: true,
    weeklyReport: false,
  });

  const items = [
    ["newAppointment", "New Appointment Booked", "Get notified when a patient books an appointment."],
    ["appointmentReminder", "Appointment Reminders", "Receive reminders before a consultation."],
    ["patientMessage", "Patient Messages", "Alerts for messages from patients."],
    ["systemUpdates", "System Updates", "Platform maintenance and announcements."],
    ["weeklyReport", "Weekly Summary Report", "Receive a summary of your activity."],
  ];

  return (
    <div>
      <PageHeading
        eyebrow="Preferences"
        title="Notifications"
        description="Control the alerts you receive."
      />

      <Section
        title="Notification Preferences"
        subtitle="Choose which notifications you want."
        icon={Bell}
      >
        <div className="py-1">
          {items.map(([key, label, description]) => (
            <div
              key={key}
              className="flex items-center justify-between gap-5 py-4 border-b border-slate-100 last:border-0"
            >
              <div>
                <p className="text-sm font-medium text-slate-700">
                  {label}
                </p>

                <p className="text-xs text-slate-400 mt-1">
                  {description}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setPrefs({
                    ...prefs,
                    [key]: !prefs[key],
                  })
                }
                className={`relative w-11 h-6 rounded-full shrink-0 ${
                  prefs[key] ? "bg-teal-600" : "bg-slate-200"
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow ${
                    prefs[key] ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}


function SecurityTab() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <PageHeading
        eyebrow="Account"
        title="Security"
        description="Manage your account security."
      />

      <Section
        title="Password"
        subtitle="Update your account password."
        icon={Lock}
      >
        <div className="py-5">
          {!showPassword ? (
            <button
              type="button"
              onClick={() => setShowPassword(true)}
              className="flex items-center gap-2 px-4 h-9 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-600"
            >
              <Pencil size={13} />
              Change Password
            </button>
          ) : (
            <div className="max-w-md space-y-3">
              <input
                type="password"
                placeholder="Current Password"
                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm"
              />

              <input
                type="password"
                placeholder="New Password"
                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm"
              />

              <input
                type="password"
                placeholder="Confirm New Password"
                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm"
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  className="px-5 h-9 rounded-lg bg-teal-600 text-white text-xs font-semibold"
                >
                  Update Password
                </button>

                <button
                  type="button"
                  onClick={() => setShowPassword(false)}
                  className="px-5 h-9 rounded-lg bg-slate-100 text-slate-600 text-xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </Section>

      <Section
        title="Active Sessions"
        subtitle="Devices associated with your account."
        icon={Monitor}
      >
        <div className="py-1">
          <Session
            icon={Monitor}
            device="Chrome · Windows 11"
            location="Current session"
            current
          />

          <Session
            icon={Smartphone}
            device="Safari · iPhone"
            location="Previously active"
          />
        </div>
      </Section>
    </div>
  );
}


function Session({ icon: Icon, device, location, current }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 border-b border-slate-100 last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center">
          <Icon size={16} className="text-slate-500" />
        </div>

        <div>
          <p className="text-sm font-medium text-slate-700">
            {device}
          </p>

          <p className="text-xs text-slate-400 mt-1">
            {location}
          </p>
        </div>
      </div>

      {current ? (
        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-semibold">
          Current
        </span>
      ) : (
        <button
          type="button"
          className="text-xs text-red-500"
        >
          Revoke
        </button>
      )}
    </div>
  );
}


function PageHeading({ eyebrow, title, description }) {
  return (
    <div className="mb-5">
      <p className="text-[10px] uppercase tracking-[0.16em] font-semibold text-teal-600">
        {eyebrow}
      </p>

      <h1 className="text-2xl font-semibold text-slate-900 mt-1">
        {title}
      </h1>

      <p className="text-sm text-slate-500 mt-1">
        {description}
      </p>
    </div>
  );
}


const TABS = [
  {
    id: "profile",
    label: "Profile",
    icon: User,
  },
  {
    id: "complaints",
    label: "Complaints & Feedback",
    icon: MessageSquareWarning,
  },
  {
    id: "language",
    label: "Language",
    icon: Languages,
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: Bell,
  },
  {
    id: "security",
    label: "Security",
    icon: Shield,
  },
];


export default function Settings() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [doctor, setDoctor] = useState(null);

  useEffect(() => {
    fetchDoctorProfile()
      .then((data) => setDoctor(data))
      .catch(() => setDoctor(null));
  }, []);

  const renderTab = () => {
    if (activeTab === "profile") {
      return (
        <ProfileTab
          doctor={doctor}
          setDoctor={setDoctor}
        />
      );
    }

    if (activeTab === "complaints") {
      return <ComplaintsTab />;
    }

    if (activeTab === "language") {
      return <LanguageTab />;
    }

    if (activeTab === "notifications") {
      return <NotificationsTab />;
    }

    if (activeTab === "security") {
      return <SecurityTab />;
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-[#f5f8f8]">
      <Sidebar
        doctor={doctor}
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
      />

      <main
        className={`min-h-screen transition-all duration-300 ${
          isExpanded ? "ml-64" : "ml-[76px]"
        }`}
      >
        <div className="max-w-[1200px] mx-auto px-6 py-6">
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-[10px] uppercase tracking-[0.16em] font-semibold text-teal-600">
                Doctor Dashboard
              </p>

              <h1 className="text-2xl font-semibold text-slate-900 mt-1">
                Settings
              </h1>

              <p className="text-sm text-slate-500 mt-1">
                Manage your account, preferences and security.
              </p>
            </div>

            <div className="hidden md:flex items-center gap-2 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Account settings
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-5 items-start">
            <aside className="w-full lg:w-56 shrink-0 bg-white border border-slate-200 rounded-xl p-2 shadow-sm lg:sticky lg:top-6">
              <p className="px-3 py-2 text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                Settings
              </p>

              <div className="space-y-1">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const active = activeTab === tab.id;

                  return (
                    <button
                      type="button"
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition ${
                        active
                          ? "bg-slate-900 text-white"
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                      }`}
                    >
                      <Icon size={16} />

                      <span className="text-xs font-medium flex-1">
                        {tab.label}
                      </span>

                      <ChevronRight size={13} />
                    </button>
                  );
                })}
              </div>
            </aside>

            <div className="flex-1 min-w-0 w-full">
              {renderTab()}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}