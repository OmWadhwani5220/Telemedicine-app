import { Bell, CalendarDays } from "lucide-react";

export default function DashboardHeader({
  doctor,
  appointmentsToday = 0,
}) {
  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const getFirstName = (name) => {
    if (!name) return "Doctor";

    const cleaned = name
      .replace(/^dr\.?\s+/i, "")
      .trim();

    return cleaned.split(/\s+/)[0] || "Doctor";
  };

  const formattedDate = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <header className="mb-6">
      <div className="flex items-center justify-between gap-6">
        {/* LEFT */}
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-teal-600 mb-1">
            Doctor Dashboard
          </p>

          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
            {getGreeting()},{" "}
            {getFirstName(doctor?.name)}
          </h1>

          <div className="flex items-center gap-2 mt-2 text-sm text-slate-500">
            <CalendarDays size={15} />

            <span>{formattedDate}</span>

            <span className="text-slate-300">•</span>

            <span>
              {appointmentsToday} appointment
              {appointmentsToday !== 1 ? "s" : ""} today
            </span>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              window.location.href = "/notifications";
            }}
            className="
              relative
              w-10 h-10
              flex items-center justify-center
              rounded-xl
              border border-slate-200
              bg-white
              text-slate-500
              hover:text-teal-600
              hover:border-teal-200
              hover:bg-teal-50
              transition-all duration-200
            "
            aria-label="Notifications"
          >
            <Bell size={19} strokeWidth={2} />
          </button>

          <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-slate-200">
            <div
              className="
                w-10 h-10
                rounded-xl
                bg-teal-50
                border border-teal-100
                text-teal-700
                flex items-center justify-center
                text-sm font-semibold
              "
            >
              {doctor?.name
                ?.replace(/^dr\.?\s+/i, "")
                .trim()
                .split(/\s+/)
                .map((word) => word[0])
                .slice(0, 2)
                .join("")
                .toUpperCase() || "?"}
            </div>

            <div className="max-w-[150px]">
              <p className="text-sm font-semibold text-slate-800 truncate">
                Dr.{" "}
                {doctor?.name?.replace(/^dr\.?\s+/i, "").trim() ||
                  "Loading..."}
              </p>

              <p className="text-xs text-slate-400 truncate mt-0.5">
                {doctor?.specialization || "Doctor"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}