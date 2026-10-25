import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import {
  Activity,
  TrendingUp,
  Clock3,
  Users,
  CheckCircle2,
} from "lucide-react";

export default function AnalyticsCard({
  stats,
  loading = false,
}) {
  /* =========================================================
     LOADING STATE
  ========================================================= */

  if (loading || !stats) {
    return (
      <div
        className="
          karla-font
          h-full
          min-h-[320px]
          bg-white
          border border-slate-200
          rounded-xl
          p-5
          shadow-[0_2px_10px_rgba(15,23,42,0.03)]
          animate-pulse
        "
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-100" />

          <div>
            <div className="h-3.5 w-40 bg-slate-100 rounded" />
            <div className="h-2.5 w-28 bg-slate-100 rounded mt-2" />
          </div>
        </div>

        <div className="w-[150px] h-[150px] rounded-full bg-slate-100 mx-auto my-6" />

        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-14 rounded-lg bg-slate-50"
            />
          ))}
        </div>
      </div>
    );
  }

  /* =========================================================
     EXISTING DATA — PRESERVED
  ========================================================= */

  const attended = Number(stats.completed || 0);
  const missed = Number(stats.cancelled || 0);

  const total = attended + missed;

  const percentage =
    stats.attendanceRate ??
    (total > 0
      ? Math.round((attended / total) * 100)
      : 0);

  /*
   * Important:
   * We don't artificially turn 0 completed appointments
   * into 1. If both values are 0, the chart displays
   * an empty ring instead.
   */
  const data =
    total > 0
      ? [
          {
            name: "Attended",
            value: attended,
          },
          {
            name: "Missed",
            value: missed,
          },
        ]
      : [
          {
            name: "No activity",
            value: 1,
          },
        ];

  const COLORS =
    total > 0
      ? ["#0d9488", "#e2e8f0"]
      : ["#e2e8f0"];

  return (
    <div
      className="
        karla-font
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

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="
              w-9 h-9
              rounded-lg
              bg-violet-50
              text-violet-600
              flex items-center justify-center
            "
          >
            <Activity size={18} />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Monthly Activity
            </h2>

            <p className="text-[11px] text-slate-400 mt-0.5">
              Practice performance overview
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <TrendingUp size={14} />

          <span>
            {stats.growth >= 0 ? "+" : ""}
            {stats.growth ?? 0}%
          </span>
        </div>
      </div>

      {/* =====================================================
          CHART
      ===================================================== */}

      <div className="flex items-center justify-center mt-3">
        <div className="relative w-[165px] h-[165px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                innerRadius={58}
                outerRadius={76}
                paddingAngle={total > 0 ? 3 : 0}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index]}
                  />
                ))}
              </Pie>

              {total > 0 && (
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    fontSize: "11px",
                  }}
                />
              )}
            </PieChart>
          </ResponsiveContainer>

          {/* Center */}
          <div
            className="
              absolute
              inset-0
              flex
              flex-col
              items-center
              justify-center
              pointer-events-none
            "
          >
            <p className="text-2xl font-semibold text-slate-900 tracking-tight">
              {percentage}%
            </p>

            <p className="text-[10px] text-slate-400 mt-0.5">
              attendance
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================
          LEGEND
      ===================================================== */}

      <div className="flex items-center justify-center gap-5 -mt-2 mb-4">
        <Legend
          dotClass="bg-teal-600"
          label="Attended"
          value={attended}
        />

        <Legend
          dotClass="bg-slate-200"
          label="Missed"
          value={missed}
        />
      </div>

      {/* =====================================================
          METRICS
      ===================================================== */}

      <div className="grid grid-cols-2 gap-2.5">
        <Metric
          icon={Users}
          label="Avg / Day"
          value={`${stats.avgPerDay ?? 0}`}
          suffix="patients"
        />

        <Metric
          icon={CheckCircle2}
          label="Avg / Month"
          value={`${stats.avgPerMonth ?? 0}`}
          suffix="patients"
        />

        <Metric
          icon={Clock3}
          label="Total Hours"
          value={`${stats.hoursSpent ?? 0}`}
          suffix="hrs"
        />

        <Metric
          icon={TrendingUp}
          label="Growth"
          value={`${stats.growth >= 0 ? "+" : ""}${
            stats.growth ?? 0
          }`}
          suffix="%"
        />
      </div>
    </div>
  );
}


/* =========================================================
   LEGEND
========================================================= */

function Legend({ dotClass, label, value }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`
          w-2 h-2
          rounded-full
          ${dotClass}
        `}
      />

      <span className="text-[10px] text-slate-400">
        {label}
      </span>

      <span className="text-[10px] font-semibold text-slate-700">
        {value}
      </span>
    </div>
  );
}


/* =========================================================
   METRIC
========================================================= */

function Metric({
  icon: Icon,
  label,
  value,
  suffix,
}) {
  return (
    <div
      className="
        flex items-center gap-2.5
        rounded-lg
        bg-slate-50
        border border-slate-100
        px-3 py-2.5
      "
    >
      <div
        className="
          w-7 h-7
          rounded-md
          bg-white
          text-slate-500
          border border-slate-100
          flex items-center justify-center
          flex-shrink-0
        "
      >
        <Icon size={13} />
      </div>

      <div className="min-w-0">
        <p className="text-[9px] text-slate-400 truncate">
          {label}
        </p>

        <p className="text-xs font-semibold text-slate-800 mt-0.5">
          {value}{" "}
          <span className="font-normal text-slate-400">
            {suffix}
          </span>
        </p>
      </div>
    </div>
  );
}