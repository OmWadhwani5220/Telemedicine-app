import { NavLink, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  Bell,
  Users,
  FilePlus2,
  Settings,
  LogOut,
  ChevronRight,
  Video,
  LayoutDashboard,
} from "lucide-react";

export default function Sidebar({ doctor, isExpanded, setIsExpanded }) {
  const navigate = useNavigate();

  const menuItems = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      path: "/",
    },
    {
      name: "Appointments",
      icon: CalendarDays,
      path: "/appointments",
    },
    {
      name: "Notifications",
      icon: Bell,
      path: "/notifications",
    },
    {
      name: "Patients",
      icon: Users,
      path: "/patients",
    },
    {
      name: "Prescription Upload",
      icon: FilePlus2,
      path: "/prescriptions",
    },
    {
      name: "Video Call",
      icon: Video,
      path: "/VideoCall",
    },
    {
      name: "Settings",
      icon: Settings,
      path: "/settings",
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "https://telemedicine-app-six-beryl.vercel.app/";
  };

  const getInitials = (name) => {
    if (!name) return "?";

    const cleanedName = name
      .replace(/^dr\.?\s+/i, "")
      .trim();

    if (!cleanedName) return "?";

    const words = cleanedName.split(/\s+/);

    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }

    return (
      words[0].charAt(0) +
      words[words.length - 1].charAt(0)
    ).toUpperCase();
  };

  const displayDoctorName = doctor?.name
    ? doctor.name.replace(/^dr\.?\s+/i, "").trim()
    : "";

  return (
    <aside
      className={`
        fixed top-0 left-0 z-50 h-screen
        flex flex-col
        transition-all duration-300 ease-in-out
        ${
          isExpanded
          ? "w-64 bg-[#115E59] border-r border-teal-800/40 shadow-[4px_0_20px_rgba(15,94,89,0.18)]"
          : "w-[76px] bg-[#115E59] border-r border-teal-800/40 shadow-[4px_0_20px_rgba(15,94,89,0.18)]"
}
      `}
    >

      {/* ------------------------------------------------
          BRAND / COLLAPSE BUTTON
      ------------------------------------------------ */}

      <div
        className={`
          h-[76px]
          flex items-center
          border-b
          transition-colors duration-300
          ${
            isExpanded
              ? "justify-between px-5 border-slate-100"
              : "justify-center border-white/10"
          }
        `}
      >

        {isExpanded && (
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center gap-3 group"
          >
            <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-sm">
              <span className="text-lg font-semibold">+</span>
            </div>

            <div className="text-left">
              <p className="text-[15px] font-semibold text-slate-900 leading-none">
                TeleMed
              </p>

              <p className="text-[10px] text-slate-400 mt-1 tracking-wide">
                DOCTOR PANEL
              </p>
            </div>
          </button>
        )}

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
          className={`
            w-9 h-9
            flex items-center justify-center
            rounded-lg
            transition-all duration-200
            ${
              isExpanded
                ? "border border-slate-200 bg-white text-slate-500 hover:text-teal-600 hover:border-teal-200 hover:bg-teal-50"
                : "border border-white/10 bg-white/10 text-white hover:bg-white/15"
            }
          `}
        >
          <ChevronRight
            size={18}
            strokeWidth={2}
            className={`
              transition-transform duration-300
              ${isExpanded ? "rotate-180" : ""}
            `}
          />
        </button>

      </div>


      {/* ------------------------------------------------
          NAVIGATION
      ------------------------------------------------ */}

      <div className="flex-1 overflow-y-auto px-3 py-5">

        {isExpanded && (
          <p className="px-3 mb-3 text-[10px] font-semibold tracking-[0.14em] text-slate-400 uppercase">
            Main Menu
          </p>
        )}

        <nav className="space-y-1.5">

          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  group relative
                  flex items-center
                  h-11
                  rounded-xl
                  transition-all duration-200

                  ${
                    isExpanded
                      ? "px-3 gap-3"
                      : "justify-center px-0"
                  }

                  ${
                    isExpanded
                      ? isActive
                        ? "bg-teal-50 text-teal-700"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                      : isActive
                        ? "bg-white/15 text-white"
                        : "text-white/65 hover:bg-white/10 hover:text-white"
                  }
                `}
              >
                {({ isActive }) => (
                  <>
                    {/* Active indicator */}
                    {isActive && (
                      <span
                        className={`
                          absolute
                          top-1/2
                          -translate-y-1/2
                          w-[3px]
                          h-6
                          rounded-r-full
                          ${
                            isExpanded
                              ? "left-0 bg-teal-600"
                              : "left-0 bg-white"
                          }
                        `}
                      />
                    )}

                    <Icon
                      size={19}
                      strokeWidth={isActive ? 2.3 : 2}
                      className={`
                        flex-shrink-0
                        transition-colors duration-200

                        ${
                          isExpanded
                            ? isActive
                              ? "text-teal-600"
                              : "text-slate-400 group-hover:text-slate-600"
                            : isActive
                              ? "text-white"
                              : "text-white/65 group-hover:text-white"
                        }
                      `}
                    />

                    {isExpanded && (
                      <span
                        className={`
                          text-[13px]
                          whitespace-nowrap

                          ${
                            isActive
                              ? "font-semibold"
                              : "font-medium"
                          }
                        `}
                      >
                        {item.name}
                      </span>
                    )}

                    {/* Tooltip for collapsed sidebar */}
                    {!isExpanded && (
                      <span
                        className="
                          pointer-events-none
                          absolute left-[62px]
                          z-[70]
                          whitespace-nowrap
                          rounded-lg
                          bg-slate-900
                          px-3 py-2
                          text-xs text-white
                          opacity-0
                          translate-x-1
                          group-hover:opacity-100
                          group-hover:translate-x-0
                          transition-all duration-150
                          shadow-lg
                        "
                      >
                        {item.name}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}

        </nav>

      </div>


      {/* ------------------------------------------------
          BOTTOM AREA
      ------------------------------------------------ */}

      <div className="px-3 pb-4">

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          className={`
            group relative
            flex items-center
            w-full h-11
            rounded-xl
            transition-all duration-200

            ${
              isExpanded
                ? "px-3 gap-3 text-slate-500 hover:text-red-600 hover:bg-red-50"
                : "justify-center px-0 text-white/65 hover:text-white hover:bg-white/10"
            }
          `}
        >
          <LogOut
            size={19}
            strokeWidth={2}
            className="flex-shrink-0"
          />

          {isExpanded && (
            <span className="text-[13px] font-medium">
              Logout
            </span>
          )}

          {!isExpanded && (
            <span
              className="
                pointer-events-none
                absolute left-[62px]
                whitespace-nowrap
                rounded-lg
                bg-slate-900
                px-3 py-2
                text-xs text-white
                opacity-0
                translate-x-1
                group-hover:opacity-100
                group-hover:translate-x-0
                transition-all duration-150
                shadow-lg
              "
            >
              Logout
            </span>
          )}
        </button>


        {/* Divider */}
        <div
          className={`
            my-3 border-t
            ${
              isExpanded
                ? "border-slate-100"
                : "border-white/10"
            }
          `}
        />


        {/* ------------------------------------------------
            DOCTOR PROFILE
        ------------------------------------------------ */}

        <button
          type="button"
          onClick={() => navigate("/profile")}
          className={`
            group relative
            w-full
            flex items-center
            rounded-xl
            transition-all duration-200

            ${
              isExpanded
                ? "p-2.5 gap-3 hover:bg-slate-50"
                : "justify-center p-1.5 hover:bg-white/10"
            }
          `}
        >

          {/* Initial Avatar */}
          <div
            className={`
              w-10 h-10
              flex-shrink-0
              rounded-xl
              flex items-center justify-center
              font-semibold
              text-sm
              transition-all duration-200

              ${
                isExpanded
                  ? "bg-teal-50 border border-teal-100 text-teal-700"
                  : "bg-white/15 border border-white/15 text-white"
              }
            `}
          >
            {getInitials(doctor?.name)}
          </div>


          {isExpanded && (
            <div className="min-w-0 flex-1 text-left">

              <p className="text-[13px] font-semibold text-slate-800 truncate">
                Dr. {displayDoctorName || "Loading..."}
              </p>

              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                {doctor?.specialization || "Doctor"}
              </p>

            </div>
          )}


          {isExpanded && (
            <ChevronRight
              size={15}
              className="flex-shrink-0 text-slate-300 group-hover:text-teal-500 transition-colors"
            />
          )}


          {!isExpanded && (
            <span
              className="
                pointer-events-none
                absolute left-[62px]
                z-[70]
                whitespace-nowrap
                rounded-lg
                bg-slate-900
                px-3 py-2
                text-xs text-white
                opacity-0
                translate-x-1
                group-hover:opacity-100
                group-hover:translate-x-0
                transition-all duration-150
                shadow-lg
              "
            >
              Dr. {displayDoctorName || "Doctor"} · Profile
            </span>
          )}

        </button>

      </div>

    </aside>
  );
}