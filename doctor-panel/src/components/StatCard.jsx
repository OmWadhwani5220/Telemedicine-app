function StatCard({
  label,
  value,
  description,
  icon: Icon,
  loading = false,
}) {
  return (
    <div
      className="
        bg-white
        border border-slate-200
        rounded-xl
        px-5 py-4
        shadow-[0_2px_8px_rgba(15,23,42,0.03)]
        hover:shadow-[0_6px_18px_rgba(15,23,42,0.06)]
        hover:border-slate-300
        transition-all duration-200
      "
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500">
            {label}
          </p>

          {loading ? (
            <div className="h-8 w-14 mt-2 rounded-lg bg-slate-100 animate-pulse" />
          ) : (
            <p className="text-2xl font-semibold text-slate-900 mt-1 tracking-tight">
              {value}
            </p>
          )}

          {!loading && description && (
            <p className="text-[11px] text-slate-400 mt-1">
              {description}
            </p>
          )}
        </div>

        {Icon && (
          <div
            className="
              w-9 h-9
              flex items-center justify-center
              rounded-lg
              bg-teal-50
              text-teal-600
              flex-shrink-0
            "
          >
            <Icon size={18} strokeWidth={2} />
          </div>
        )}
      </div>
    </div>
  );
}

export default StatCard;