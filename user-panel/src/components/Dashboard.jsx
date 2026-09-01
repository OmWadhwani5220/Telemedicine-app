import React, { useState, useEffect } from "react";
import {
  Calendar, Activity, FileText, Pill, Heart,
  Clock, ChevronRight, AlertCircle, ArrowRight,
  Video, User, Ruler, Weight, Droplet, Stethoscope,
} from "lucide-react";
import { getPatientProfile, getMyAppointments } from "../services/api";
import "./Dashboard.css";

const BACKEND_URL = import.meta.env?.VITE_BACKEND_URL || "http://localhost:5000";

export default function Dashboard({ patientName = "Patient", navigateTo, profileComplete }) {
  const [patient,       setPatient]       = useState(null);
  const [appointments,  setAppointments]  = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const token = localStorage.getItem("token");
        const [profileRes, apptRes, rxRes] = await Promise.all([
          getPatientProfile(),
          getMyAppointments(),
          fetch(`${BACKEND_URL}/api/prescriptions/my`, {
            headers: { Authorization: `Bearer ${token}` },
            credentials: "include",
          }).then(r => (r.ok ? r.json() : { prescriptions: [] })).catch(() => ({ prescriptions: [] })),
        ]);
        if (profileRes?.patient) setPatient(profileRes.patient);
        if (Array.isArray(apptRes)) setAppointments(apptRes);
        if (Array.isArray(rxRes?.prescriptions)) setPrescriptions(rxRes.prescriptions);
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const PROTECTED = ["appointments", "symptoms", "video", "records", "prescriptions"];
  const isLocked = (screen) => PROTECTED.includes(screen) && !profileComplete;

  const quickLinks = [
    { label: "Book Appointment",   icon: Calendar, screen: "appointments",  color: "#0d9286" },
    { label: "Symptom Checker",    icon: Activity, screen: "symptoms",      color: "#8b5cf6" },
    { label: "Medical Records",    icon: FileText, screen: "records",       color: "#f97316" },
    { label: "Prescriptions",      icon: Pill,     screen: "prescriptions", color: "#10b981" },
    { label: "Video Consultation", icon: Video,    screen: "video",         color: "#3b82f6" },
  ];

  const upcoming = appointments
    .filter(a => a.status !== "cancelled")
    .slice()
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 4);

  const fmtDate = (iso) => {
    if (!iso) return "—";
    try {
      const d = new Date(iso);
      return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
    } catch { return iso; }
  };

  const initialsOf = (name) =>
    (name || "Dr").split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();

  // Purely decorative ring percentages derived from real values where possible
  const heightPct = patient?.height ? Math.min(100, Math.round((patient.height / 200) * 100)) : 0;
  const weightPct = patient?.weight ? Math.min(100, Math.round((patient.weight / 100) * 100)) : 0;
  const apptPct   = Math.min(100, appointments.length * 12);
  const rxPct     = Math.min(100, prescriptions.length * 15);

  return (
    <div className="db-wrap">

      {/* ── Greeting ── */}
      <div className="db-topline">
        <div className="db-greeting">
          <h1>Hello, {patientName} 👋</h1>
          <p>Here's an overview of your health &amp; upcoming care</p>
        </div>
      </div>

      {/* ── Profile incomplete alert ── */}
      {profileComplete === false && (
        <div className="db-alert">
          <div className="db-alert-icon">
            <AlertCircle size={19} color="#f59e0b" />
          </div>
          <div className="db-alert-text">
            <p>Complete Your Profile</p>
            <p>Fill in your profile details to unlock appointments, symptom checker, and all other features.</p>
          </div>
          <button className="db-alert-btn" onClick={() => navigateTo("settings")}>
            Complete Profile <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* ── Banner + Health card ── */}
      <div className="db-hero-row">
        <div className="db-banner">
          <div className="db-banner-text">
            <h2>Welcome to your Patient Dashboard</h2>
            <p>Book appointments, track prescriptions, and manage your health records — all in one place.</p>
            <div className="db-banner-actions">
              <button className="db-btn db-btn-solid" onClick={() => navigateTo("appointments")}>
                <Calendar size={15} /> Book Appointment
              </button>
              <button className="db-btn db-btn-outline" onClick={() => navigateTo("records")}>
                View Records
              </button>
            </div>
          </div>
          <div className="db-banner-icon">
            <Stethoscope size={40} color="#fff" />
          </div>
        </div>

        <div className="db-health-card">
          <h3>Health Overview</h3>
          <div className="db-health-row">
            <span className="db-health-label">
              <span className="db-health-dot" style={{ background: "#10b981" }} />
              Blood Group
            </span>
            <span className="db-health-value">{patient?.bloodGroup || "—"}</span>
          </div>
          <div className="db-health-row">
            <span className="db-health-label">
              <span className="db-health-dot" style={{ background: "#3b82f6" }} />
              Gender
            </span>
            <span className="db-health-value">{patient?.gender || "—"}</span>
          </div>
          <div className="db-health-row">
            <span className="db-health-label">
              <span className="db-health-dot" style={{ background: "#f59e0b" }} />
              Phone
            </span>
            <span className="db-health-value">{patient?.phone || "—"}</span>
          </div>
        </div>
      </div>

      {/* ── Stat rings ── */}
      <div className="db-stats-grid">
        <StatCard icon={<Ruler size={16} color="#0d9286" />} label="Height" value={patient?.height ? `${patient.height} cm` : "—"} pct={heightPct} color="#0d9286" />
        <StatCard icon={<Weight size={16} color="#3b82f6" />} label="Weight" value={patient?.weight ? `${patient.weight} kg` : "—"} pct={weightPct} color="#3b82f6" />
        <StatCard icon={<Calendar size={16} color="#f97316" />} label="Appointments" value={String(appointments.length)} pct={apptPct} color="#f97316" />
        <StatCard icon={<Pill size={16} color="#8b5cf6" />} label="Prescriptions" value={String(prescriptions.length)} pct={rxPct} color="#8b5cf6" />
      </div>

      {/* ── Main grid ── */}
      <div className="db-content-grid">

        {/* Left column */}
        <div>
          {/* Quick access */}
          <div className="db-panel">
            <div className="db-panel-head">
              <h3>Quick Access</h3>
            </div>
            <div className="db-quick-grid">
              {quickLinks.map(({ label, icon: Icon, screen, color }) => {
                const locked = isLocked(screen);
                return (
                  <div
                    key={screen}
                    className={`db-quick-tile${locked ? " db-locked" : ""}`}
                    onClick={() => !locked && navigateTo(screen)}
                    title={locked ? "Complete your profile to unlock" : label}
                  >
                    {locked && <span className="db-quick-lock">🔒</span>}
                    <div className="db-quick-icon" style={{ background: `${color}1a` }}>
                      <Icon size={19} color={color} />
                    </div>
                    <span>{label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent appointments table */}
          <div className="db-panel">
            <div className="db-panel-head">
              <h3>Recent Appointments</h3>
              <button className="db-panel-link" onClick={() => navigateTo("appointments")}>
                Book new <ChevronRight size={13} />
              </button>
            </div>

            {loading ? (
              <div className="db-spin" />
            ) : appointments.length === 0 ? (
              <div className="db-empty">
                <div className="db-empty-icon"><Calendar size={22} color="#94a3b8" /></div>
                <p>No appointments yet</p>
                <button
                  className="db-empty-btn"
                  onClick={() => navigateTo(profileComplete ? "appointments" : "settings")}
                >
                  {profileComplete ? "Book your first appointment" : "Complete profile first"}
                </button>
              </div>
            ) : (
              <table className="db-table">
                <thead>
                  <tr>
                    <th>Doctor</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.slice(0, 6).map(appt => (
                    <tr key={appt._id}>
                      <td>
                        <div className="db-doc-cell">
                          <div className="db-doc-avatar">
                            {initialsOf(appt.doctorId?.name)}
                          </div>
                          <div>
                            <div className="db-doc-name">Dr. {appt.doctorId?.name ?? "Doctor"}</div>
                            <div className="db-doc-spec">{appt.doctorId?.specialization ?? ""}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`status-pill status-${appt.status || "pending"}`}>
                          {appt.status || "pending"}
                        </span>
                      </td>
                      <td>{fmtDate(appt.date)}</td>
                      <td style={{ display: "flex", alignItems: "center", gap: 5, color: "#94a3b8" }}>
                        <Clock size={12} /> {appt.timeSlot}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right column */}
        <div>
          {/* Appointment timeline */}
          <div className="db-panel">
            <div className="db-panel-head">
              <h3>Appointment Timeline</h3>
              <button className="db-panel-link" onClick={() => navigateTo("appointments")}>
                See All <ChevronRight size={13} />
              </button>
            </div>

            {loading ? (
              <div className="db-spin" />
            ) : upcoming.length === 0 ? (
              <div className="db-empty">
                <p>No upcoming appointments</p>
              </div>
            ) : (
              <div className="db-timeline">
                {upcoming.map(appt => (
                  <div key={appt._id} className="db-timeline-item">
                    <div className="db-timeline-dot-wrap">
                      <div className="db-timeline-dot" />
                    </div>
                    <div>
                      <div className="db-timeline-date">{fmtDate(appt.date)} · {appt.timeSlot}</div>
                      <p className="db-timeline-title">Dr. {appt.doctorId?.name ?? "Doctor"}</p>
                      <p className="db-timeline-sub">{appt.doctorId?.specialization ?? appt.consultationType ?? ""}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Prescriptions preview */}
          <div className="db-panel">
            <div className="db-panel-head">
              <h3>Recent Prescriptions</h3>
              <button className="db-panel-link" onClick={() => navigateTo("prescriptions")}>
                See All <ChevronRight size={13} />
              </button>
            </div>

            {loading ? (
              <div className="db-spin" />
            ) : prescriptions.length === 0 ? (
              <div className="db-empty">
                <p>No prescriptions yet</p>
              </div>
            ) : (
              prescriptions.slice(0, 3).map(item => (
                <div key={item._id} className="db-rx-item">
                  <div className="db-rx-icon">
                    <FileText size={15} />
                  </div>
                  <div>
                    <p className="db-rx-title">Dr. {item.doctorName}</p>
                    <p className="db-rx-sub">{item.prescription?.diagnosis || "Prescription issued"}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, pct, color }) {
  return (
    <div className="db-stat-card">
      <div className="db-stat-info">
        <p>{label}</p>
        <p>{value}</p>
      </div>
      <div className="db-stat-ring" style={{ "--pct": pct, "--ring-color": color }}>
        <div className="db-stat-ring-inner">{icon}</div>
      </div>
    </div>
  );
}
