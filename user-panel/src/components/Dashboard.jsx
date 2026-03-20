import React, { useState, useEffect } from "react";
import {
  User, Bell, Calendar, Activity, FileText,
  Pill, MessageSquare, Heart, Clock, ChevronRight,
} from "lucide-react";
import { getPatientProfile, getMyAppointments } from "../services/api";

export default function Dashboard({ patientName = "Patient", navigateTo }) {
  const [patient,      setPatient]      = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [profileRes, apptRes] = await Promise.all([
          getPatientProfile(),
          getMyAppointments(),
        ]);
        if (profileRes?.patient) setPatient(profileRes.patient);
        if (Array.isArray(apptRes)) setAppointments(apptRes);
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const quickLinks = [
    {
      label: "Book Appointment",
      icon: Calendar,
      screen: "appointments",
      color: "bg-blue-500",
      bg: "bg-blue-50",
      text: "text-blue-600",
    },
    {
      label: "Symptom Checker",
      icon: Activity,
      screen: "symptoms",
      color: "bg-purple-500",
      bg: "bg-purple-50",
      text: "text-purple-600",
    },
    {
      label: "Medical Records",
      icon: FileText,
      screen: "records",
      color: "bg-orange-500",
      bg: "bg-orange-50",
      text: "text-orange-600",
    },
    {
      label: "Prescriptions",
      icon: Pill,
      screen: "prescriptions",
      color: "bg-green-500",
      bg: "bg-green-50",
      text: "text-green-600",
    },
    {
      label: "Messages",
      icon: MessageSquare,
      screen: "messages",
      color: "bg-pink-500",
      bg: "bg-pink-50",
      text: "text-pink-600",
    },
    {
      label: "Video Consultation",
      icon: Calendar,
      screen: "video",
      color: "bg-teal-500",
      bg: "bg-teal-50",
      text: "text-teal-600",
    },
  ];

  const statusColors = {
    pending:   "bg-yellow-100 text-yellow-700",
    confirmed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
    completed: "bg-blue-100 text-blue-700",
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">

      {/* ── Top Bar ── */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-gray-800 text-xl font-semibold">Dashboard</h1>
          <p className="text-gray-400 text-sm">
            Welcome back, {patientName} 👋
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="p-2 hover:bg-gray-100 rounded-lg relative">
            <Bell className="w-5 h-5 text-gray-500" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <div className="w-9 h-9 bg-emerald-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-emerald-600" />
          </div>
        </div>
      </nav>

      {/* ── Main ── */}
      <main className="flex-1 p-6">

        {/* Profile Summary Card */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 mb-6 text-white shadow-lg">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-emerald-100 text-sm">Patient</p>
              <h2 className="text-2xl font-bold">{patientName}</h2>
              {patient && (
                <div className="flex flex-wrap gap-3 mt-2 text-sm text-emerald-100">
                  {patient.bloodGroup && (
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3" /> {patient.bloodGroup}
                    </span>
                  )}
                  {patient.gender && <span>• {patient.gender}</span>}
                  {patient.phone  && <span>• {patient.phone}</span>}
                </div>
              )}
            </div>
            <button
              onClick={() => navigateTo("settings")}
              className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg text-sm transition-all"
            >
              Edit Profile
            </button>
          </div>

          {/* Quick health stats */}
          {patient && (
            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white border-opacity-20">
              <div className="text-center">
                <p className="text-2xl font-bold">{patient.height ?? "—"}</p>
                <p className="text-emerald-100 text-xs">Height (cm)</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{patient.weight ?? "—"}</p>
                <p className="text-emerald-100 text-xs">Weight (kg)</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{appointments.length}</p>
                <p className="text-emerald-100 text-xs">Appointments</p>
              </div>
            </div>
          )}
        </div>

        {/* Quick Links Grid */}
        <h3 className="text-gray-700 font-semibold mb-3">Quick Access</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          {quickLinks.map(({ label, icon: Icon, screen, bg, text }) => (
            <button
              key={screen}
              onClick={() => navigateTo(screen)}
              className={`${bg} rounded-xl p-4 flex flex-col items-center space-y-2
                hover:scale-105 transition-transform shadow-sm`}
            >
              <Icon className={`w-6 h-6 ${text}`} />
              <span className={`text-xs font-medium ${text} text-center`}>{label}</span>
            </button>
          ))}
        </div>

        {/* Recent Appointments */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-800 font-semibold">Recent Appointments</h3>
            <button
              onClick={() => navigateTo("appointments")}
              className="text-emerald-600 text-sm flex items-center hover:underline"
            >
              Book new <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-10">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No appointments yet</p>
              <button
                onClick={() => navigateTo("appointments")}
                className="mt-3 px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm hover:bg-emerald-600 transition-colors"
              >
                Book your first appointment
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {appointments.slice(0, 5).map((appt) => (
                <div
                  key={appt._id}
                  className="flex items-center space-x-4 p-3 bg-gray-50 rounded-xl"
                >
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-800 text-sm font-medium truncate">
                      {appt.doctorId?.name ?? "Doctor"}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {appt.doctorId?.specialization ?? ""}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-gray-400 text-xs">
                      <Clock className="w-3 h-3" />
                      {appt.date} • {appt.timeSlot}
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[appt.status] ?? "bg-gray-100 text-gray-600"}`}
                  >
                    {appt.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}