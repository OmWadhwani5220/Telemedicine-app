import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";

import {
  fetchDoctorProfile,
  fetchAllAppointments,
  updateAppointmentStatus,
} from "../api/api";

import {
  X,
  CalendarDays,
  Clock3,
  UserRound,
  ChevronRight,
  CheckCircle2,
  XCircle,
  CircleAlert,
  Stethoscope,
  Droplets,
  Activity,
  FileText,
  Search,
} from "lucide-react";

export default function Appointments() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [profileRes, apptRes] = await Promise.all([
          fetchDoctorProfile(),
          fetchAllAppointments(),
        ]);

        setDoctor(profileRes);
        setAppointments(apptRes);
      } catch (err) {
        console.error("Appointments load error:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const getDisplayStatus = (status) => {
    if (status === "pending" || status === "confirmed") {
      return "Upcoming";
    }

    if (status === "completed") {
      return "Completed";
    }

    if (status === "cancelled") {
      return "Cancelled";
    }

    return status;
  };

  const filtered = appointments.filter((appointment) => {
    let matchesFilter = true;

    if (filter === "Upcoming") {
      matchesFilter =
        appointment.status === "pending" ||
        appointment.status === "confirmed";
    }

    if (filter === "Completed") {
      matchesFilter = appointment.status === "completed";
    }

    if (filter === "Cancelled") {
      matchesFilter = appointment.status === "cancelled";
    }

    if (!matchesFilter) {
      return false;
    }

    if (!search.trim()) {
      return true;
    }

    const query = search.toLowerCase();

    return (
      appointment.name?.toLowerCase().includes(query) ||
      appointment.patientDisplayId
        ?.toLowerCase()
        .includes(query)
    );
  });

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    setUpdating(true);

    try {
      await updateAppointmentStatus(
        appointmentId,
        newStatus
      );

      setAppointments((prev) =>
        prev.map((appointment) =>
          appointment.appointmentId === appointmentId
            ? {
                ...appointment,
                status: newStatus,
              }
            : appointment
        )
      );

      if (
        selectedAppt?.appointmentId === appointmentId
      ) {
        setSelectedAppt((prev) => ({
          ...prev,
          status: newStatus,
        }));
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update appointment status.");
    } finally {
      setUpdating(false);
    }
  };

  const today = new Date().toLocaleDateString(
    "en-US",
    {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }
  );

  const counts = {
    All: appointments.length,

    Upcoming: appointments.filter(
      (a) =>
        a.status === "pending" ||
        a.status === "confirmed"
    ).length,

    Completed: appointments.filter(
      (a) => a.status === "completed"
    ).length,

    Cancelled: appointments.filter(
      (a) => a.status === "cancelled"
    ).length,
  };

  return (
    <div className="min-h-screen bg-[#f5f8f8]">

      <Sidebar
        doctor={doctor}
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
      />

      <main
        className={`
          min-h-screen
          transition-all
          duration-300
          ease-in-out
          ${isExpanded ? "ml-64" : "ml-[76px]"}
        `}
      >

        <div className="max-w-[1500px] mx-auto px-5 py-6 md:px-7 lg:px-8">

          {/* =========================================
              HEADER
          ========================================= */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">

            <div>

              <p className="text-[11px] uppercase tracking-[0.16em] font-semibold text-teal-600">
                Doctor Dashboard
              </p>

              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 mt-1">
                Appointments
              </h1>

              <p className="text-sm text-slate-500 mt-1">
                Manage your consultations and appointment schedule.
              </p>

            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">

              <CalendarDays className="w-4 h-4" />

              {today}

            </div>

          </div>


          {/* =========================================
              SUMMARY CARDS
          ========================================= */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">

            <SummaryCard
              label="Total"
              value={loading ? "—" : counts.All}
              icon={<CalendarDays />}
              iconClass="bg-blue-50 text-blue-600"
            />

            <SummaryCard
              label="Upcoming"
              value={loading ? "—" : counts.Upcoming}
              icon={<Clock3 />}
              iconClass="bg-teal-50 text-teal-600"
            />

            <SummaryCard
              label="Completed"
              value={loading ? "—" : counts.Completed}
              icon={<CheckCircle2 />}
              iconClass="bg-emerald-50 text-emerald-600"
            />

            <SummaryCard
              label="Cancelled"
              value={loading ? "—" : counts.Cancelled}
              icon={<XCircle />}
              iconClass="bg-red-50 text-red-500"
            />

          </div>


          {/* =========================================
              FILTER / SEARCH BAR
          ========================================= */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-[0_2px_8px_rgba(15,23,42,0.03)] p-3 mb-5">

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">

              {/* Filters */}
              <div className="flex items-center gap-1.5 overflow-x-auto">

                {[
                  "All",
                  "Upcoming",
                  "Completed",
                  "Cancelled",
                ].map((type) => (

                  <button
                    key={type}
                    onClick={() => setFilter(type)}
                    className={`
                      shrink-0
                      px-3.5
                      py-2
                      rounded-lg
                      text-xs
                      font-medium
                      transition-all
                      ${
                        filter === type
                          ? "bg-slate-900 text-white shadow-sm"
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                      }
                    `}
                  >
                    {type}

                    <span
                      className={`
                        ml-1.5
                        ${
                          filter === type
                            ? "text-white/60"
                            : "text-slate-400"
                        }
                      `}
                    >
                      {counts[type]}
                    </span>
                  </button>

                ))}

              </div>


              {/* Search */}
              <div className="relative w-full md:w-64">

                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                <input
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search patient..."
                  className="
                    w-full
                    h-9
                    pl-9
                    pr-3
                    rounded-lg
                    border
                    border-slate-200
                    bg-slate-50
                    text-sm
                    text-slate-700
                    placeholder:text-slate-400
                    outline-none
                    focus:bg-white
                    focus:border-teal-300
                    focus:ring-2
                    focus:ring-teal-50
                    transition
                  "
                />

              </div>

            </div>

          </div>


          {/* =========================================
              APPOINTMENT TABLE
          ========================================= */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-[0_2px_10px_rgba(15,23,42,0.035)] overflow-hidden">

            {/* Table header */}
            <div className="hidden lg:grid grid-cols-[1.1fr_2fr_0.7fr_0.8fr_1.2fr_1fr_0.6fr] gap-4 px-6 py-3.5 bg-slate-50/70 border-b border-slate-100">

              <TableHeader>Date</TableHeader>
              <TableHeader>Patient</TableHeader>
              <TableHeader>Age</TableHeader>
              <TableHeader>Gender</TableHeader>
              <TableHeader>Time</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader></TableHeader>

            </div>


            {/* Loading */}
            {loading && (
              <div>
                {[1, 2, 3, 4].map((item) => (
                  <AppointmentSkeleton key={item} />
                ))}
              </div>
            )}


            {/* Empty */}
            {!loading && filtered.length === 0 && (
              <div className="px-6 py-16 text-center">

                <div className="w-12 h-12 mx-auto rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                  <CalendarDays className="w-5 h-5 text-slate-400" />
                </div>

                <h3 className="text-sm font-semibold text-slate-800 mt-4">
                  No appointments found
                </h3>

                <p className="text-xs text-slate-400 mt-1">
                  {search
                    ? "Try a different patient name or ID."
                    : `There are no ${filter.toLowerCase()} appointments.`}
                </p>

              </div>
            )}


            {/* Appointment rows */}
            {!loading &&
              filtered.map((appt) => (

                <AppointmentRow
                  key={appt.appointmentId}
                  appointment={appt}
                  onClick={() =>
                    setSelectedAppt(appt)
                  }
                  getDisplayStatus={
                    getDisplayStatus
                  }
                />

              ))}

          </div>

          {!loading && filtered.length > 0 && (
            <p className="text-xs text-slate-400 mt-3 px-1">
              Showing {filtered.length}{" "}
              {filtered.length === 1
                ? "appointment"
                : "appointments"}
            </p>
          )}

        </div>

      </main>


      {/* ===========================================
          DETAIL MODAL
      =========================================== */}
      {selectedAppt && (
        <AppointmentModal
          appointment={selectedAppt}
          updating={updating}
          onClose={() => setSelectedAppt(null)}
          onStatusUpdate={handleStatusUpdate}
          getDisplayStatus={getDisplayStatus}
        />
      )}

    </div>
  );
}


/* =================================================
   SUMMARY CARD
================================================= */

function SummaryCard({
  label,
  value,
  icon,
  iconClass,
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-[0_2px_8px_rgba(15,23,42,0.025)]">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-[11px] uppercase tracking-wide font-medium text-slate-400">
            {label}
          </p>

          <p className="text-xl font-semibold text-slate-900 mt-1">
            {value}
          </p>

        </div>

        <div
          className={`
            w-9 h-9
            rounded-lg
            flex
            items-center
            justify-center
            ${iconClass}
          `}
        >
          <span className="[&>svg]:w-[17px] [&>svg]:h-[17px]">
            {icon}
          </span>
        </div>

      </div>

    </div>
  );
}


/* =================================================
   TABLE HEADER
================================================= */

function TableHeader({ children }) {
  return (
    <div className="text-[10px] uppercase tracking-[0.08em] font-semibold text-slate-400">
      {children}
    </div>
  );
}


/* =================================================
   APPOINTMENT ROW
================================================= */

function AppointmentRow({
  appointment,
  onClick,
  getDisplayStatus,
}) {
  return (
    <div
      onClick={onClick}
      className="
        group
        border-b
        border-slate-100
        last:border-b-0
        hover:bg-slate-50/60
        transition-colors
        cursor-pointer
      "
    >

      {/* Desktop */}
      <div className="hidden lg:grid grid-cols-[1.1fr_2fr_0.7fr_0.8fr_1.2fr_1fr_0.6fr] gap-4 items-center px-6 py-4">

        <div className="text-xs text-slate-500">
          {appointment.date}
        </div>


        <div className="flex items-center gap-3 min-w-0">

          <PatientAvatar name={appointment.name} />

          <div className="min-w-0">

            <p className="text-sm font-semibold text-slate-800 truncate">
              {appointment.name || "Unknown Patient"}
            </p>

            <p className="text-[11px] text-slate-400 mt-0.5">
              #{appointment.patientDisplayId || "—"}
            </p>

          </div>

        </div>


        <div className="text-xs text-slate-600">
          {appointment.age ?? "—"}
        </div>


        <div className="text-xs text-slate-600 capitalize">
          {appointment.gender ?? "—"}
        </div>


        <div className="flex items-center gap-1.5 text-xs text-slate-600">

          <Clock3 className="w-3.5 h-3.5 text-slate-400" />

          {appointment.timeSlot || "—"}

        </div>


        <StatusBadge
          status={appointment.status}
          label={getDisplayStatus(
            appointment.status
          )}
        />


        <div className="flex justify-end">

          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 group-hover:text-teal-600 group-hover:bg-teal-50 transition-all">

            <ChevronRight className="w-4 h-4" />

          </div>

        </div>

      </div>


      {/* Mobile / Tablet */}
      <div className="lg:hidden p-4">

        <div className="flex items-center gap-3">

          <PatientAvatar name={appointment.name} />

          <div className="flex-1 min-w-0">

            <div className="flex items-center justify-between gap-3">

              <p className="text-sm font-semibold text-slate-800 truncate">
                {appointment.name || "Unknown Patient"}
              </p>

              <StatusBadge
                status={appointment.status}
                label={getDisplayStatus(
                  appointment.status
                )}
              />

            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">

              <span className="text-xs text-slate-400">
                {appointment.date}
              </span>

              <span className="text-xs text-slate-400">
                {appointment.timeSlot}
              </span>

              {appointment.age != null && (
                <span className="text-xs text-slate-400">
                  {appointment.age} yrs
                </span>
              )}

            </div>

          </div>

          <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />

        </div>

      </div>

    </div>
  );
}


/* =================================================
   PATIENT AVATAR
================================================= */

function PatientAvatar({ name = "" }) {
  const words = name.trim().split(/\s+/);

  const initials =
    words.length > 1
      ? `${words[0]?.[0] || ""}${words[words.length - 1]?.[0] || ""}`
      : words[0]?.[0] || "P";

  return (
    <div className="w-9 h-9 shrink-0 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-semibold text-slate-600">
      {initials.toUpperCase()}
    </div>
  );
}


/* =================================================
   STATUS BADGE
================================================= */

function StatusBadge({ status, label }) {
  const config = {
    pending: {
      className:
        "bg-amber-50 text-amber-700 border-amber-100",
      icon: CircleAlert,
    },

    confirmed: {
      className:
        "bg-teal-50 text-teal-700 border-teal-100",
      icon: CheckCircle2,
    },

    completed: {
      className:
        "bg-slate-50 text-slate-600 border-slate-200",
      icon: CheckCircle2,
    },

    cancelled: {
      className:
        "bg-red-50 text-red-600 border-red-100",
      icon: XCircle,
    },
  };

  const item =
    config[status] || {
      className:
        "bg-slate-50 text-slate-500 border-slate-200",
      icon: CircleAlert,
    };

  const Icon = item.icon;

  return (
    <span
      className={`
        inline-flex
        items-center
        gap-1.5
        w-fit
        px-2.5
        py-1
        rounded-full
        border
        text-[10px]
        font-semibold
        ${item.className}
      `}
    >
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}


/* =================================================
   SKELETON
================================================= */

function AppointmentSkeleton() {
  return (
    <div className="px-6 py-5 border-b border-slate-100 animate-pulse">

      <div className="flex items-center gap-4">

        <div className="w-9 h-9 rounded-full bg-slate-100" />

        <div className="flex-1 space-y-2">

          <div className="h-3 w-32 bg-slate-100 rounded" />

          <div className="h-2.5 w-20 bg-slate-100 rounded" />

        </div>

        <div className="h-6 w-20 bg-slate-100 rounded-full" />

      </div>

    </div>
  );
}


/* =================================================
   MODAL
================================================= */

function AppointmentModal({
  appointment,
  updating,
  onClose,
  onStatusUpdate,
  getDisplayStatus,
}) {
  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        bg-slate-950/40
        backdrop-blur-[2px]
        p-4
      "
      onClick={onClose}
    >

      <div
        className="
          bg-white
          rounded-2xl
          w-full
          max-w-xl
          shadow-[0_20px_60px_rgba(15,23,42,0.18)]
          max-h-[90vh]
          overflow-y-auto
        "
        onClick={(e) => e.stopPropagation()}
      >

        {/* Modal header */}
        <div className="px-6 py-5 border-b border-slate-100">

          <div className="flex items-start justify-between gap-4">

            <div className="flex items-center gap-3">

              <PatientAvatar name={appointment.name} />

              <div>

                <h2 className="text-base font-semibold text-slate-900">
                  {appointment.name}
                </h2>

                <p className="text-xs text-slate-400 mt-0.5">
                  Patient #{appointment.patientDisplayId || "—"}
                </p>

              </div>

            </div>

            <button
              onClick={onClose}
              className="
                w-8
                h-8
                rounded-lg
                flex
                items-center
                justify-center
                text-slate-400
                hover:text-slate-700
                hover:bg-slate-50
                transition
              "
            >
              <X className="w-4 h-4" />
            </button>

          </div>

        </div>


        <div className="p-6">

          {/* Appointment overview */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">

            <div className="flex flex-wrap items-center justify-between gap-4">

              <div>

                <p className="text-[10px] uppercase tracking-[0.1em] font-semibold text-slate-400">
                  Appointment
                </p>

                <div className="flex items-center gap-2 mt-1.5">

                  <CalendarDays className="w-4 h-4 text-teal-600" />

                  <p className="text-sm font-semibold text-slate-800">
                    {appointment.date}
                  </p>

                  <span className="text-slate-300">
                    •
                  </span>

                  <Clock3 className="w-4 h-4 text-teal-600" />

                  <p className="text-sm font-semibold text-slate-800">
                    {appointment.timeSlot}
                  </p>

                </div>

                {appointment.consultationType && (
                  <p className="text-xs text-slate-400 mt-1 capitalize">
                    {appointment.consultationType} consultation
                  </p>
                )}

              </div>

              <StatusBadge
                status={appointment.status}
                label={getDisplayStatus(
                  appointment.status
                )}
              />

            </div>

          </div>


          {/* Patient details */}
          <div className="mt-6">

            <p className="text-[11px] uppercase tracking-[0.12em] font-semibold text-slate-400 mb-4">
              Patient Details
            </p>

            <div className="grid sm:grid-cols-2 gap-4">

              <DetailItem
                icon={<UserRound />}
                label="Age"
                value={
                  appointment.age != null
                    ? `${appointment.age} years`
                    : "—"
                }
              />

              <DetailItem
                icon={<UserRound />}
                label="Gender"
                value={
                  appointment.gender || "—"
                }
              />

              <DetailItem
                icon={<Droplets />}
                label="Blood Group"
                value={
                  appointment.bloodGroup || "—"
                }
              />

              <DetailItem
                icon={<Activity />}
                label="Chronic Disease"
                value={
                  appointment.hasChronicDisease != null
                    ? appointment.hasChronicDisease
                      ? "Yes"
                      : "No"
                    : "—"
                }
              />

            </div>

          </div>


          {/* AI diagnosis */}
          <div className="mt-6">

            <DetailBlock
              icon={<Stethoscope />}
              label="AI Diagnosis"
              value={
                appointment.aiDiagnosis ||
                "Not available"
              }
            />

          </div>


          {/* Notes */}
          <div className="mt-4">

            <DetailBlock
              icon={<FileText />}
              label="Symptoms / Notes"
              value={
                appointment.notes || "None"
              }
            />

          </div>


          {/* Actions */}
          <div className="mt-6 pt-5 border-t border-slate-100">

            {appointment.status === "pending" && (
              <div className="flex flex-col sm:flex-row gap-2.5">

                <button
                  disabled={updating}
                  onClick={() =>
                    onStatusUpdate(
                      appointment.appointmentId,
                      "confirmed"
                    )
                  }
                  className="
                    flex-1
                    h-10
                    rounded-lg
                    bg-teal-600
                    text-white
                    text-xs
                    font-semibold
                    hover:bg-teal-700
                    transition
                    disabled:opacity-50
                  "
                >
                  {updating
                    ? "Updating..."
                    : "Confirm Appointment"}
                </button>

                <button
                  disabled={updating}
                  onClick={() =>
                    onStatusUpdate(
                      appointment.appointmentId,
                      "cancelled"
                    )
                  }
                  className="
                    h-10
                    px-5
                    rounded-lg
                    border
                    border-red-200
                    text-red-600
                    text-xs
                    font-semibold
                    hover:bg-red-50
                    transition
                    disabled:opacity-50
                  "
                >
                  Cancel
                </button>

              </div>
            )}

            {appointment.status === "confirmed" && (
              <button
                disabled={updating}
                onClick={() =>
                  onStatusUpdate(
                    appointment.appointmentId,
                    "completed"
                  )
                }
                className="
                  w-full
                  h-10
                  rounded-lg
                  bg-slate-900
                  text-white
                  text-xs
                  font-semibold
                  hover:bg-slate-800
                  transition
                  disabled:opacity-50
                "
              >
                {updating
                  ? "Updating..."
                  : "Mark as Completed"}
              </button>
            )}

            {(appointment.status === "completed" ||
              appointment.status === "cancelled") && (
              <p className="text-xs text-center text-slate-400">
                This appointment has been{" "}
                {appointment.status}.
              </p>
            )}

          </div>

        </div>


        {/* Close */}
        <div className="px-6 pb-6">

          <button
            onClick={onClose}
            className="
              w-full
              h-10
              rounded-lg
              border
              border-slate-200
              text-slate-500
              text-xs
              font-medium
              hover:bg-slate-50
              hover:text-slate-700
              transition
            "
          >
            Close
          </button>

        </div>

      </div>

    </div>
  );
}


/* =================================================
   DETAIL ITEM
================================================= */

function DetailItem({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3">

      <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
        <span className="[&>svg]:w-4 [&>svg]:h-4">
          {icon}
        </span>
      </div>

      <div>

        <p className="text-[10px] uppercase tracking-wide font-medium text-slate-400">
          {label}
        </p>

        <p className="text-xs font-semibold text-slate-700 mt-0.5">
          {value}
        </p>

      </div>

    </div>
  );
}


/* =================================================
   DETAIL BLOCK
================================================= */

function DetailBlock({ icon, label, value }) {
  return (
    <div>

      <div className="flex items-center gap-2 mb-2">

        <span className="text-teal-600">
          {icon}
        </span>

        <p className="text-[10px] uppercase tracking-wide font-semibold text-slate-400">
          {label}
        </p>

      </div>

      <div className="rounded-lg bg-slate-50 border border-slate-100 px-3.5 py-3">

        <p className="text-xs leading-5 text-slate-600">
          {value}
        </p>

      </div>

    </div>
  );
}