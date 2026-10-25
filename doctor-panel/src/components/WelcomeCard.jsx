import { useEffect, useState } from "react";
import {
  CalendarDays,
  Clock3,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";

export default function WelcomeCard({
  doctor,
  appointmentsToday = 0,
  loading = false,
}) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();

    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";

    return "Good Evening";
  };

  const getDoctorName = () => {
    if (!doctor?.name) return "Doctor";

    return doctor.name
      .replace(/^dr\.?\s*/i, "")
      .trim();
  };

  const formattedDate = currentTime.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const formattedTime = currentTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <section
      className="
        relative
        overflow-hidden
        rounded-2xl
        bg-gradient-to-br
        from-teal-700
        via-teal-600
        to-teal-500
        shadow-[0_12px_35px_rgba(15,118,110,0.18)]
        animate-welcome-in
      "
    >
      {/* -----------------------------------------
          ABSTRACT BACKGROUND GRAPHICS
      ----------------------------------------- */}

      <div
        className="
          absolute
          -right-16
          -top-20
          h-64
          w-64
          rounded-full
          border-[28px]
          border-white/10
          animate-soft-float
        "
      />

      <div
        className="
          absolute
          right-24
          -bottom-24
          h-44
          w-44
          rounded-full
          bg-white/[0.06]
        "
      />

      <div
        className="
          absolute
          right-10
          top-10
          h-3
          w-3
          rounded-full
          bg-white/30
        "
      />

      <div
        className="
          absolute
          right-36
          top-28
          h-2
          w-2
          rounded-full
          bg-white/20
        "
      />

      {/* subtle medical cross */}
      <div className="absolute right-10 bottom-8 opacity-[0.07]">
        <div className="relative h-28 w-28">
          <div className="absolute left-1/2 top-0 h-full w-7 -translate-x-1/2 rounded-full bg-white" />
          <div className="absolute left-0 top-1/2 h-7 w-full -translate-y-1/2 rounded-full bg-white" />
        </div>
      </div>

      {/* -----------------------------------------
          CONTENT
      ----------------------------------------- */}

      <div className="relative px-6 py-6 md:px-8 md:py-7">

        <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">

          {/* -----------------------------------------
              LEFT — GREETING
          ----------------------------------------- */}

          <div className="max-w-xl">

            {/* Date */}
            <div className="mb-4 flex items-center gap-2.5">

              <div
                className="
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-lg
                  bg-white/15
                  border
                  border-white/10
                  backdrop-blur-sm
                "
              >
                <CalendarDays className="h-4 w-4 text-white" />
              </div>

              <span className="text-xs font-medium text-white/75">
                {formattedDate}
              </span>

            </div>

            {/* Greeting */}
            <h1
              className="
                text-2xl
                font-semibold
                tracking-tight
                text-white
                md:text-[30px]
              "
            >
              {getGreeting()},{" "}

              {loading ? (
                <span className="text-white/60">
                  Loading...
                </span>
              ) : (
                <span className="text-white">
                  Dr. {getDoctorName()}
                </span>
              )}
            </h1>

            <p className="mt-2 text-sm leading-6 text-white/70">
              Here's your practice overview for today.
            </p>

            {/* Small status */}
            <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur-sm">

              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-200 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-200" />
              </span>

              <span className="text-xs font-medium text-white/85">
                Practice active today
              </span>

            </div>

          </div>


          {/* -----------------------------------------
              RIGHT — TODAY SUMMARY
          ----------------------------------------- */}

          <div className="flex flex-wrap gap-3 lg:flex-nowrap">

            {/* Appointments */}
            <div
              className="
                min-w-[185px]
                rounded-xl
                border
                border-white/10
                bg-white/10
                p-4
                backdrop-blur-md
                transition-all
                duration-300
                hover:-translate-y-1
                hover:bg-white/[0.14]
              "
            >

              <div className="flex items-start justify-between">

                <div
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-lg
                    bg-white
                  "
                >
                  <CalendarDays className="h-[18px] w-[18px] text-teal-700" />
                </div>

                <Sparkles className="h-4 w-4 text-white/40" />

              </div>

              <p className="mt-4 text-[11px] font-medium uppercase tracking-wider text-white/55">
                Today's schedule
              </p>

              <p className="mt-1 text-xl font-semibold text-white">
                {loading
                  ? "..."
                  : appointmentsToday}
              </p>

              <p className="mt-0.5 text-xs text-white/60">
                {appointmentsToday === 1
                  ? "appointment"
                  : "appointments"}
              </p>

            </div>


            {/* Current time */}
            <div
              className="
                hidden
                min-w-[155px]
                rounded-xl
                border
                border-white/10
                bg-white/[0.07]
                p-4
                backdrop-blur-md
                transition-all
                duration-300
                hover:-translate-y-1
                hover:bg-white/[0.12]
                sm:block
              "
            >

              <div
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-lg
                  bg-white/10
                "
              >
                <Clock3 className="h-[18px] w-[18px] text-white" />
              </div>

              <p className="mt-4 text-[11px] font-medium uppercase tracking-wider text-white/55">
                Current time
              </p>

              <p className="mt-1 text-xl font-semibold text-white">
                {formattedTime}
              </p>

              <p className="mt-0.5 text-xs text-white/60">
                Local time
              </p>

            </div>

          </div>

        </div>


        {/* -----------------------------------------
            BOTTOM BAR
        ----------------------------------------- */}

        <div className="mt-7 flex items-center justify-between border-t border-white/10 pt-4">

          <p className="hidden text-xs text-white/55 sm:block">
            Keep track of consultations, patients and practice activity.
          </p>

          <div className="ml-auto flex items-center gap-1.5 text-xs font-medium text-white/80 transition-all duration-200 hover:gap-2.5">
            <span>Practice overview</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </div>

        </div>

      </div>
    </section>
  );
}