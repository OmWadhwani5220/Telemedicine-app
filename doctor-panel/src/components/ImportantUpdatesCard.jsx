import {
  Bell,
  ChevronRight,
  FlaskConical,
  Building2,
  ShieldCheck,
} from "lucide-react";

export default function ImportantUpdatesCard({
  updates = [],
}) {
  const limitedUpdates = updates.slice(0, 3);

  const getIcon = (category = "") => {
    const value = category.toLowerCase();

    if (
      value.includes("research") ||
      value.includes("medical")
    ) {
      return FlaskConical;
    }

    if (
      value.includes("ministry") ||
      value.includes("health")
    ) {
      return ShieldCheck;
    }

    return Building2;
  };

  const getIconStyle = (index) => {
    const styles = [
      "bg-violet-50 text-violet-600",
      "bg-blue-50 text-blue-600",
      "bg-amber-50 text-amber-600",
    ];

    return styles[index % styles.length];
  };

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

      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div
            className="
              w-9 h-9
              rounded-lg
              bg-amber-50
              text-amber-600
              flex items-center justify-center
            "
          >
            <Bell size={18} />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Recent Updates
            </h2>

            <p className="text-[11px] text-slate-400 mt-0.5">
              Important information for your practice
            </p>
          </div>
        </div>

        {limitedUpdates.length > 0 && (
          <span
            className="
              min-w-6 h-6
              px-1.5
              rounded-md
              bg-slate-50
              border border-slate-100
              text-[10px]
              font-semibold
              text-slate-500
              flex items-center justify-center
            "
          >
            {limitedUpdates.length}
          </span>
        )}
      </div>

      {/* =====================================================
          EMPTY STATE
      ===================================================== */}

      {limitedUpdates.length === 0 ? (
        <div className="min-h-[220px] flex flex-col items-center justify-center text-center">
          <div
            className="
              w-10 h-10
              rounded-xl
              bg-slate-50
              border border-slate-100
              text-slate-400
              flex items-center justify-center
            "
          >
            <Bell size={18} />
          </div>

          <p className="text-sm font-semibold text-slate-700 mt-3">
            No new updates
          </p>

          <p className="text-xs text-slate-400 mt-1">
            Important announcements will appear here.
          </p>
        </div>
      ) : (
        /* ===================================================
           UPDATES
        =================================================== */
        <div className="relative">
          {/* Timeline */}
          <div className="absolute left-[15px] top-4 bottom-4 w-px bg-slate-100" />

          <div className="space-y-1">
            {limitedUpdates.map((item, index) => {
              const Icon = getIcon(item.category);

              return (
                <div
                  key={index}
                  className="
                    relative
                    flex gap-3
                    p-2.5
                    rounded-lg
                    hover:bg-slate-50
                    transition-colors
                    group
                  "
                >
                  {/* Icon */}
                  <div
                    className={`
                      relative
                      z-10
                      w-7 h-7
                      rounded-lg
                      flex items-center justify-center
                      flex-shrink-0
                      border border-white
                      ${getIconStyle(index)}
                    `}
                  >
                    <Icon size={13} />
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <span
                        className="
                          text-[9px]
                          uppercase
                          tracking-wide
                          font-semibold
                          text-slate-400
                          truncate
                        "
                      >
                        {item.category}
                      </span>

                      <span className="text-[9px] text-slate-400 whitespace-nowrap">
                        {item.date}
                      </span>
                    </div>

                    <h3
                      className="
                        text-xs
                        font-semibold
                        text-slate-800
                        mt-1
                        leading-4
                      "
                    >
                      {item.title}
                    </h3>

                    <p
                      className="
                        text-[10px]
                        leading-4
                        text-slate-400
                        mt-1
                        line-clamp-2
                      "
                    >
                      {item.preview}
                    </p>
                  </div>

                  {/* Hover arrow */}
                  <ChevronRight
                    size={13}
                    className="
                      self-center
                      text-slate-200
                      group-hover:text-slate-400
                      transition-colors
                      flex-shrink-0
                    "
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}