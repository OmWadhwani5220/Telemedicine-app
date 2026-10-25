import { useState } from "react";
import Sidebar from "../components/Sidebar";

import {
  Bell,
  CalendarDays,
  Settings,
  FlaskConical,
  CheckCircle2,
  Inbox,
} from "lucide-react";


export default function Notifications() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filter, setFilter] = useState("All");

  const notifications = [
    {
      id: 1,
      title: "New Appointment Booked",
      message: "A new patient has booked an appointment for 3:00 PM.",
      time: "10 mins ago",
      type: "Appointment",
      read: false,
    },
    {
      id: 2,
      title: "System Maintenance",
      message:
        "Scheduled maintenance on October 25 may cause slight delays.",
      time: "1 hour ago",
      type: "System",
      read: true,
    },
    {
      id: 3,
      title: "Medical Update Released",
      message:
        "New research guidelines on hypertension have been published.",
      time: "Yesterday",
      type: "Update",
      read: false,
    },
  ];

  const unreadCount = notifications.filter((n) => !n.read).length;
  const readCount = notifications.filter((n) => n.read).length;

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "Unread") return !notification.read;
    if (filter === "Read") return notification.read;
    return true;
  });

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-[#f5f8f8]">

      {/* Sidebar */}
      <Sidebar
        doctor={null}
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
      />

      {/* Main Content */}
      <main
        className={`
          min-h-screen
          transition-all
          duration-300
          ${isExpanded ? "ml-64" : "ml-[76px]"}
        `}
      >
        <div className="max-w-[1200px] mx-auto px-5 py-6 md:px-7 lg:px-8">

          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">

            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] font-semibold text-teal-600">
                Doctor Dashboard
              </p>

              <div className="flex items-center gap-2 mt-1">
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                  Notifications
                </h1>

                {unreadCount > 0 && (
                  <span className="min-w-5 h-5 px-1.5 rounded-full bg-teal-600 text-white text-[10px] font-semibold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </div>

              <p className="text-sm text-slate-500 mt-1">
                Stay updated with important alerts and system messages.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <CalendarDays size={15} />
              {today}
            </div>

          </div>


          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-5">

            <SummaryCard
              label="All Notifications"
              value={notifications.length}
              icon={<Inbox size={17} />}
              iconClass="bg-blue-50 text-blue-600"
            />

            <SummaryCard
              label="Unread"
              value={unreadCount}
              icon={<Bell size={17} />}
              iconClass="bg-teal-50 text-teal-600"
            />

            <SummaryCard
              label="Read"
              value={readCount}
              icon={<CheckCircle2 size={17} />}
              iconClass="bg-emerald-50 text-emerald-600"
            />

          </div>


          {/* Filters */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-3 mb-5">

            <div className="flex items-center justify-between gap-3">

              <div className="flex items-center gap-1.5">

                {["All", "Unread", "Read"].map((type) => {

                  const count =
                    type === "All"
                      ? notifications.length
                      : type === "Unread"
                      ? unreadCount
                      : readCount;

                  return (
                    <button
                      key={type}
                      onClick={() => setFilter(type)}
                      className={`
                        px-3.5
                        py-2
                        rounded-lg
                        text-xs
                        font-medium
                        transition-all
                        ${
                          filter === type
                            ? "bg-slate-900 text-white"
                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                        }
                      `}
                    >
                      {type}
                      <span className="ml-1.5 opacity-60">
                        {count}
                      </span>
                    </button>
                  );
                })}

              </div>

              <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400">
                <Bell size={13} />

                {unreadCount === 0
                  ? "You're all caught up"
                  : `${unreadCount} unread ${
                      unreadCount === 1
                        ? "notification"
                        : "notifications"
                    }`}
              </div>

            </div>

          </div>


          {/* Notification Container */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

            {/* Container Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">

              <div>
                <h2 className="text-sm font-semibold text-slate-800">
                  Recent Notifications
                </h2>

                <p className="text-[11px] text-slate-400 mt-0.5">
                  Your latest alerts and updates
                </p>
              </div>

              <span className="text-[10px] text-slate-400">
                {filteredNotifications.length}{" "}
                {filteredNotifications.length === 1 ? "item" : "items"}
              </span>

            </div>


            {/* Empty State */}
            {filteredNotifications.length === 0 && (
              <div className="py-16 text-center">

                <div className="w-12 h-12 mx-auto rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                  <Bell size={20} className="text-slate-400" />
                </div>

                <h3 className="text-sm font-semibold text-slate-800 mt-4">
                  No notifications
                </h3>

                <p className="text-xs text-slate-400 mt-1">
                  There are no notifications in this category.
                </p>

              </div>
            )}


            {/* Notification List */}
            {filteredNotifications.map((notification, index) => (

              <NotificationItem
                key={notification.id}
                notification={notification}
                isLast={index === filteredNotifications.length - 1}
              />

            ))}

          </div>


          <p className="text-[11px] text-slate-400 mt-3 px-1">
            Notifications are currently displayed from the existing application data.
          </p>

        </div>
      </main>

    </div>
  );
}


/* =====================================================
   SUMMARY CARD
===================================================== */

function SummaryCard({
  label,
  value,
  icon,
  iconClass,
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">

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
            w-9
            h-9
            rounded-lg
            flex
            items-center
            justify-center
            ${iconClass}
          `}
        >
          {icon}
        </div>

      </div>

    </div>
  );
}


/* =====================================================
   NOTIFICATION ITEM
===================================================== */

function NotificationItem({
  notification,
  isLast,
}) {
  let Icon = FlaskConical;
  let iconClass = "bg-violet-50 text-violet-600";
  let typeClass = "bg-violet-50 text-violet-700 border-violet-100";

  if (notification.type === "Appointment") {
    Icon = CalendarDays;
    iconClass = "bg-blue-50 text-blue-600";
    typeClass = "bg-blue-50 text-blue-700 border-blue-100";
  }

  if (notification.type === "System") {
    Icon = Settings;
    iconClass = "bg-slate-100 text-slate-500";
    typeClass = "bg-slate-50 text-slate-600 border-slate-200";
  }

  return (
    <div
      className={`
        px-5
        py-5
        hover:bg-slate-50/60
        transition-colors
        ${!isLast ? "border-b border-slate-100" : ""}
        ${!notification.read ? "bg-teal-50/[0.18]" : ""}
      `}
    >

      <div className="flex items-start gap-4">

        {/* Icon */}
        <div className="relative shrink-0">

          <div
            className={`
              w-10
              h-10
              rounded-xl
              flex
              items-center
              justify-center
              ${iconClass}
            `}
          >
            <Icon size={18} />
          </div>

          {!notification.read && (
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-teal-500 border-2 border-white" />
          )}

        </div>


        {/* Content */}
        <div className="flex-1 min-w-0">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">

            <div className="flex flex-wrap items-center gap-2">

              <h3
                className={`
                  text-sm
                  text-slate-800
                  ${
                    notification.read
                      ? "font-medium"
                      : "font-semibold"
                  }
                `}
              >
                {notification.title}
              </h3>

              <span
                className={`
                  px-2
                  py-0.5
                  rounded-full
                  border
                  text-[9px]
                  font-semibold
                  ${typeClass}
                `}
              >
                {notification.type}
              </span>

            </div>

            <span className="text-[11px] text-slate-400">
              {notification.time}
            </span>

          </div>


          <p className="text-xs leading-5 text-slate-500 mt-1.5">
            {notification.message}
          </p>


          <div className="flex items-center gap-1.5 mt-3">

            {notification.read ? (
              <>
                <CheckCircle2
                  size={13}
                  className="text-slate-300"
                />

                <span className="text-[10px] text-slate-400">
                  Read
                </span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-teal-500" />

                <span className="text-[10px] font-medium text-teal-600">
                  Unread
                </span>
              </>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}