import { useState } from "react";
import {
  X,
  Clock3,
  UserRound,
  Droplets,
  Activity,
  Stethoscope,
  Video,
  CheckCircle2,
} from "lucide-react";
import { updateAppointmentStatus } from "../api/api";

export default function NextAppointmentCard({
  appointment,
  loading = false,
  onUpdate,
}) {
  const [showModal, setShowModal] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);

  // ---------------------------------------------------------
  // EXISTING FUNCTIONALITY — PRESERVED
  // ---------------------------------------------------------
  const handleAccept = async () => {
    if (!appointment) return;

    setAccepting(true);

    try {
      await updateAppointmentStatus(
        appointment.appointmentId,
        "confirmed"
      );

      setAccepted(true);

      if (onUpdate) {
        onUpdate({
          ...appointment,
          status: "confirmed",
        });
      }
    } catch (err) {
      console.error("Accept error:", err);
      alert(
        "Failed to accept consultation. Please try again."
      );
    } finally {
      setAccepting(false);
    }
  };

  // ---------------------------------------------------------
  // LOADING STATE
  // ---------------------------------------------------------
  if (loading) {
    return (
      <div className="h-full min-h-[280px] bg-white border border-slate-200 rounded-xl p-5 shadow-[0_2px_10px_rgba(15,23,42,0.03)] animate-pulse">
        <div className="flex justify-between">
          <div className="space-y-2">
            <div className="h-3 w-28 bg-slate-100 rounded" />
            <div className="h-6 w-40 bg-slate-100 rounded" />
          </div>

          <div className="h-8 w-20 bg-slate-100 rounded-lg" />
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6">
          {[1, 2, 3, 4].map((item) => (
            <div key={item}>
              <div className="h-2.5 w-16 bg-slate-100 rounded mb-2" />
              <div className="h-3.5 w-24 bg-slate-100 rounded" />
            </div>
          ))}
        </div>

        <div className="h-10 bg-slate-100 rounded-lg mt-6" />
      </div>
    );
  }

  // ---------------------------------------------------------
  // EMPTY STATE
  // ---------------------------------------------------------
if (!appointment) {
  return (
    <div
      className="
        h-full
        min-h-[220px]
        bg-gradient-to-br from-teal-50/80 via-white to-white
        border border-teal-100
        rounded-xl
        p-5
        flex flex-col
        justify-between
      "
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.12em] font-semibold text-teal-600">
            Next Appointment
          </p>

          <p className="text-xs text-slate-400 mt-1">
            Your upcoming consultation
          </p>
        </div>

        <div className="w-9 h-9 rounded-lg bg-white border border-teal-100 text-teal-600 flex items-center justify-center">
          <CalendarEmptyIcon />
        </div>
      </div>

      <div className="flex items-center gap-3 py-5">
        <div className="w-10 h-10 rounded-xl bg-white border border-teal-100 text-teal-600 flex items-center justify-center flex-shrink-0">
          <Clock3 size={18} />
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-800">
            No upcoming appointments
          </p>

          <p className="text-xs text-slate-400 mt-1">
            You're all caught up for today.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => {
          window.location.href = "/appointments";
        }}
        className="
          text-left
          text-xs
          font-semibold
          text-teal-600
          hover:text-teal-700
          transition-colors
        "
      >
        View appointments →
      </button>
    </div>
  );
}

  const isConfirmed =
    appointment.status === "confirmed" || accepted;

  return (
    <>
      {/* =====================================================
          MAIN CARD
      ===================================================== */}
      <div className="h-full bg-gradient-to-br from-teal-50 via-white to-white border border-teal-100 rounded-xl p-5 shadow-[0_2px_10px_rgba(15,23,42,0.03)]">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-white border border-teal-100 text-teal-600 flex items-center justify-center flex-shrink-0">
              <UserRound size={20} strokeWidth={2} />
            </div>

            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.12em] font-semibold text-teal-600">
                Next Appointment
              </p>

              <h2 className="text-lg font-semibold text-slate-900 truncate mt-0.5">
                {appointment.name}
              </h2>

              <p className="text-[11px] text-slate-400 mt-0.5">
                #{appointment.patientDisplayId}
              </p>
            </div>
          </div>

          {/* Time */}
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-teal-100 text-teal-700 flex-shrink-0">
            <Clock3 size={14} />

            <span className="text-xs font-semibold whitespace-nowrap">
              {appointment.timeSlot}
            </span>
          </div>
        </div>

        {/* Status */}
        <div className="mt-4">
          <span
            className={`
              inline-flex items-center gap-1.5
              px-2.5 py-1
              rounded-md
              text-[10px]
              font-semibold
              capitalize
              ${
                isConfirmed
                  ? "bg-emerald-50 text-emerald-700"
                  : appointment.status === "completed"
                  ? "bg-slate-100 text-slate-600"
                  : appointment.status === "cancelled"
                  ? "bg-red-50 text-red-600"
                  : "bg-amber-50 text-amber-700"
              }
            `}
          >
            {isConfirmed && <CheckCircle2 size={12} />}

            {isConfirmed
              ? "Confirmed"
              : appointment.status}
          </span>
        </div>

        {/* Patient details */}
        <div className="grid grid-cols-2 gap-x-5 gap-y-4 mt-5 pt-4 border-t border-teal-100/70">

          <DetailItem
            icon={UserRound}
            label="Age & Gender"
            value={`${appointment.age ?? "—"} yrs • ${
              appointment.gender ?? "—"
            }`}
          />

          <DetailItem
            icon={Droplets}
            label="Blood Group"
            value={appointment.bloodGroup ?? "—"}
          />

          <DetailItem
            icon={Activity}
            label="AI Diagnosis"
            value={appointment.aiDiagnosis ?? "—"}
          />

          <DetailItem
            icon={Stethoscope}
            label="Consultation"
            value={appointment.consultationType ?? "—"}
          />
        </div>

        {/* Symptoms */}
        {appointment.notes && (
          <div className="mt-4">
            <p className="text-[10px] uppercase tracking-wide font-semibold text-slate-400 mb-1">
              Symptoms / Notes
            </p>

            <p className="text-xs leading-5 text-slate-600 line-clamp-2">
              {appointment.notes}
            </p>
          </div>
        )}

        {/* Button */}
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="
            w-full
            mt-5
            h-10
            rounded-lg
            bg-teal-600
            hover:bg-teal-700
            text-white
            text-xs
            font-semibold
            transition-colors
            flex items-center justify-center gap-2
          "
        >
          View Medical Card
          <span>→</span>
        </button>
      </div>

      {/* =====================================================
          MEDICAL CARD MODAL
          Functionality preserved
      ===================================================== */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 backdrop-blur-sm p-4">

          <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto border border-slate-200">

            {/* Modal Header */}
            <div className="flex justify-between items-start px-6 py-5 border-b border-slate-100">
              <div>
                <p className="text-[10px] uppercase tracking-[0.12em] font-semibold text-teal-600">
                  Patient Medical Card
                </p>

                <h2 className="text-xl font-semibold text-slate-900 mt-1">
                  {appointment.name}
                </h2>

                <p className="text-xs text-slate-400 mt-1">
                  #{appointment.patientDisplayId}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="
                  w-8 h-8
                  flex items-center justify-center
                  rounded-lg
                  text-slate-400
                  hover:text-slate-700
                  hover:bg-slate-100
                  transition-colors
                "
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">

              {/* Timing */}
              <div className="rounded-xl bg-teal-50 border border-teal-100 p-4">
                <p className="text-[10px] uppercase tracking-wide text-teal-600 font-semibold">
                  Appointment Timing
                </p>

                <p className="text-sm font-semibold text-teal-900 mt-1">
                  {appointment.date} · {appointment.timeSlot}
                </p>

                <p className="text-xs text-teal-600 mt-1 capitalize">
                  {appointment.consultationType} consultation
                </p>
              </div>

              {/* Status */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-slate-500">
                  Status
                </span>

                <span
                  className={`
                    text-[10px]
                    px-2.5 py-1
                    rounded-md
                    font-semibold
                    capitalize
                    ${
                      isConfirmed
                        ? "bg-emerald-50 text-emerald-700"
                        : appointment.status === "completed"
                        ? "bg-slate-100 text-slate-600"
                        : appointment.status === "cancelled"
                        ? "bg-red-50 text-red-600"
                        : "bg-amber-50 text-amber-700"
                    }
                  `}
                >
                  {isConfirmed
                    ? "Confirmed"
                    : appointment.status}
                </span>
              </div>

              {/* Patient Details */}
              <div className="grid grid-cols-2 gap-4">
                <ModalField
                  label="Age"
                  value={`${appointment.age ?? "—"} yrs`}
                />

                <ModalField
                  label="Gender"
                  value={appointment.gender ?? "—"}
                />

                <ModalField
                  label="Blood Group"
                  value={appointment.bloodGroup ?? "—"}
                />

                <ModalField
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

              {appointment.hasChronicDisease &&
                appointment.chronicDiseaseDetail && (
                  <ModalField
                    label="Chronic Disease Detail"
                    value={
                      appointment.chronicDiseaseDetail
                    }
                  />
                )}

              <ModalField
                label="AI Diagnosis"
                value={
                  appointment.aiDiagnosis ??
                  "Not available"
                }
              />

              <ModalField
                label="Symptoms / Notes"
                value={
                  appointment.notes || "None provided"
                }
              />

              {appointment.meetingLink && (
                <div>
                  <p className="text-xs text-slate-400 mb-1">
                    Meeting Link
                  </p>

                  <a
                    href={appointment.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-teal-600 text-xs hover:underline break-all"
                  >
                    {appointment.meetingLink}
                  </a>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 pb-6 flex gap-3">

              {isConfirmed ? (
                <div className="flex-1 py-2.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold text-center">
                  ✓ Consultation Accepted
                </div>
              ) : appointment.status === "completed" ||
                appointment.status === "cancelled" ? null : (
                <button
                  type="button"
                  onClick={handleAccept}
                  disabled={accepting}
                  className="
                    flex-1
                    py-2.5
                    rounded-lg
                    bg-teal-600
                    text-white
                    text-xs
                    font-semibold
                    hover:bg-teal-700
                    transition-colors
                    disabled:opacity-60
                  "
                >
                  {accepting
                    ? "Accepting..."
                    : "Accept Consultation Request"}
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="
                  px-5
                  py-2.5
                  rounded-lg
                  border border-slate-200
                  text-slate-600
                  text-xs
                  font-medium
                  hover:bg-slate-50
                  transition-colors
                "
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


/* =========================================================
   UI HELPERS
========================================================= */

function DetailItem({ icon: Icon, label, value }) {
  return (
    <div className="flex gap-2.5 min-w-0">
      <div className="w-7 h-7 rounded-lg bg-white border border-teal-100 text-teal-600 flex items-center justify-center flex-shrink-0">
        <Icon size={14} />
      </div>

      <div className="min-w-0">
        <p className="text-[10px] text-slate-400">
          {label}
        </p>

        <p className="text-xs font-medium text-slate-700 truncate mt-0.5">
          {value}
        </p>
      </div>
    </div>
  );
}

function ModalField({ label, value }) {
  return (
    <div className="rounded-lg bg-slate-50 border border-slate-100 p-3">
      <p className="text-[10px] text-slate-400">
        {label}
      </p>

      <p className="text-xs text-slate-800 font-medium mt-1">
        {value}
      </p>
    </div>
  );
}

function CalendarEmptyIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}