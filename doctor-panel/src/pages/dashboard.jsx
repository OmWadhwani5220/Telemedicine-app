import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import WelcomeCard from "../components/WelcomeCard";
import AppointmentsCard from "../components/AppointmentsCard";
import NextAppointmentCard from "../components/NextAppointmentCard";
import AnalyticsCard from "../components/AnalyticsCard";
import ImportantUpdatesCard from "../components/ImportantUpdatesCard";

import {
  fetchDoctorProfile,
  fetchTodayAppointments,
  fetchMonthlyAnalytics,
} from "../api/api";

export default function Dashboard() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token || role !== "doctor") {
    window.location.href = "https://telemedicine-app-six-beryl.vercel.app/login";
    return null;
  }

  const [isExpanded, setIsExpanded] = useState(false);
  const [doctor, setDoctor] = useState(null);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [
          profileRes,
          apptRes,
          analyticsRes,
        ] = await Promise.all([
          fetchDoctorProfile(),
          fetchTodayAppointments(),
          fetchMonthlyAnalytics(),
        ]);

        setDoctor(profileRes);
        setTodayAppointments(apptRes.appointments || []);
        setAnalyticsData(analyticsRes);
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const nextAppointment =
    todayAppointments.find(
      (appointment) =>
        appointment.status === "pending" ||
        appointment.status === "confirmed"
    ) || null;

  const handleAppointmentUpdate = (updatedAppt) => {
    setTodayAppointments((prev) =>
      prev.map((appointment) =>
        appointment.appointmentId === updatedAppt.appointmentId
          ? updatedAppt
          : appointment
      )
    );
  };

  /*
   * Existing update content is preserved.
   * No fake live data is introduced.
   */
  const updatesData = [
    {
      category: "Research",
      date: "23.10.2023",
      title:
        "New managing chronic inflammation with psoriasis",
      preview:
        "Medical News Today has published an article about a new method of chronic inflammation management in psoriasis.",
    },
    {
      category: "Clinic",
      date: "23.10.2023",
      title: "Updated database",
      preview:
        "It will be updated on October 24-25. This may lead to slight slowdown in the program.",
    },
    {
      category: "Ministry of Health",
      date: "20.10.2023",
      title:
        "CoronaVac approved for emergency use",
      preview:
        "The Ministry of Health has approved Sinovac's CoronaVac vaccine for emergency use.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f5f8f8]">

      {/* Sidebar */}
      <Sidebar
        doctor={doctor}
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
      />

      {/* Main Content */}
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

          {/* -----------------------------------------
              PAGE HEADER
          ----------------------------------------- */}
          <div className="flex items-center justify-between mb-5">

            <div>

              <h2 className="text-xl font-semibold text-teal-600 mt-1">
                Dashboard
              </h2>
            </div>

            <div className="hidden sm:block text-right">
              <p className="text-xs text-slate-400">
                Your practice at a glance
              </p>

              <p className="text-sm font-medium text-slate-600 mt-0.5">
                Today's overview
              </p>
            </div>

          </div>


          {/* -----------------------------------------
              WELCOME
          ----------------------------------------- */}
          <WelcomeCard
            doctor={doctor}
            appointmentsToday={todayAppointments.length}
            loading={loading}
          />


          {/* -----------------------------------------
              MAIN DASHBOARD GRID
          ----------------------------------------- */}
          <div className="mt-5 grid grid-cols-1 xl:grid-cols-12 gap-5">

            {/* Today's appointments */}
            <div className="xl:col-span-5 min-w-0">
              <AppointmentsCard
                appointments={todayAppointments}
                loading={loading}
              />
            </div>


            {/* Next appointment */}
            <div className="xl:col-span-7 min-w-0">
              <NextAppointmentCard
                appointment={nextAppointment}
                loading={loading}
                onUpdate={handleAppointmentUpdate}
              />
            </div>


            {/* Analytics */}
            <div className="xl:col-span-7 min-w-0">
              <AnalyticsCard
                stats={analyticsData}
                loading={loading}
              />
            </div>


            {/* Updates */}
            <div className="xl:col-span-5 min-w-0">
              <ImportantUpdatesCard
                updates={updatesData}
              />
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}