import {
  CalendarDays,
  Clock3,
  UserRound,
  ChevronRight,
} from "lucide-react";

export default function AppointmentsCard({
  appointments = [],
  loading = false,
}) {
  const getStatusStyle = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";

      case "completed":
        return "bg-slate-100 text-slate-600 border-slate-200";

      case "cancelled":
        return "bg-red-50 text-red-600 border-red-100";

      default:
        return "bg-amber-50 text-amber-700 border-amber-100";
    }
  };

  return (
    <div
      className="
        h-full
        bg-white
        border border-slate-200
        rounded-xl
        p-5
        shadow-[0_2px_10px_rgba(15,23,42,0.03)]
      "
    >
      {/* =====================================================
          HEADER
      ===================================================== */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="
              w-9 h-9
              rounded-lg
              bg-blue-50
              text-blue-600
              flex items-center justify-center
            "
          >
            <CalendarDays size={18} />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Today's Appointments
            </h2>

            <p className="text-[11px] text-slate-400 mt-0.5">
              Your schedule for today
            </p>
          </div>
        </div>

        <span className="text-xs font-semibold text-slate-500">
          {appointments.length}
        </span>
      </div>

      {/* =====================================================
          LOADING STATE
      ===================================================== */}
      {loading ? (
        <div className="space-y-2.5">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="
                flex items-center gap-3
                p-3
                rounded-lg
                bg-slate-50
                animate-pulse
              "
            >
              <div className="w-9 h-9 rounded-lg bg-slate-200" />

              <div className="flex-1">
                <div className="h-3 bg-slate-200 rounded w-2/5 mb-2" />
                <div className="h-2.5 bg-slate-200 rounded w-1/3" />
              </div>

              <div className="w-12 h-3 bg-slate-200 rounded" />
            </div>
          ))}
        </div>
      ) : appointments.length === 0 ? (
        /* ===================================================
           EMPTY STATE
        =================================================== */
        <div
          className="
            min-h-[180px]
            flex flex-col
            items-center
            justify-center
            text-center
          "
        >
          <div
            className="
              w-10 h-10
              rounded-xl
              bg-blue-50
              border border-blue-100
              text-blue-500
              flex items-center justify-center
            "
          >
            <CalendarDays size={18} />
          </div>

          <p className="text-sm font-semibold text-slate-700 mt-3">
            Your schedule is clear
          </p>

          <p className="text-xs text-slate-400 mt-1">
            No consultations are scheduled for today.
          </p>

          <button
            type="button"
            onClick={() => {
              window.location.href = "/appointments";
            }}
            className="
              mt-3
              text-xs
              font-semibold
              text-blue-600
              hover:text-blue-700
              transition-colors
            "
          >
            View all appointments →
          </button>
        </div>
      ) : (
        /* ===================================================
           APPOINTMENT LIST
        =================================================== */
        <div className="space-y-2">
          {appointments.map((appt, i) => (
            <div
              key={appt.appointmentId || i}
              className="
                group
                flex items-center gap-3
                p-3
                rounded-lg
                border border-transparent
                hover:border-slate-200
                hover:bg-slate-50
                transition-all duration-200
              "
            >
              {/* Patient avatar */}
              <div
                className="
                  w-9 h-9
                  rounded-lg
                  bg-teal-50
                  text-teal-700
                  flex items-center justify-center
                  flex-shrink-0
                "
              >
                <UserRound size={16} />
              </div>

              {/* Patient */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800 truncate">
                  {appt.name}
                </p>

                <p className="text-[10px] text-slate-400 mt-1">
                  {appt.age ? `${appt.age} yrs` : ""}

                  {appt.age && appt.gender ? " • " : ""}

                  {appt.gender || ""}
                </p>
              </div>

              {/* Time + Status */}
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <div className="flex items-center gap-1 text-slate-500">
                  <Clock3 size={12} />

                  <span className="text-[10px] font-medium">
                    {appt.timeSlot}
                  </span>
                </div>

                <span
                  className={`
                    inline-flex
                    px-2 py-0.5
                    rounded-md
                    border
                    text-[9px]
                    font-semibold
                    capitalize
                    ${getStatusStyle(appt.status)}
                  `}
                >
                  {appt.status}
                </span>
              </div>

              {/* Arrow */}
              <ChevronRight
                size={14}
                className="
                  text-slate-300
                  group-hover:text-teal-500
                  transition-colors
                  flex-shrink-0
                "
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}