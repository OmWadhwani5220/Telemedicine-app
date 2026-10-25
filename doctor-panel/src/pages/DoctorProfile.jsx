import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BadgeCheck,
  BriefcaseMedical,
  Mail,
  Phone,
  GraduationCap,
  Languages,
  Clock3,
  FileCheck2,
  CalendarDays,
  UserRound,
} from "lucide-react";

import { fetchDoctorProfile } from "../api/api";

function DoctorProfile() {
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await fetchDoctorProfile();
        setDoctor(data?.doctor || data);
      } catch (err) {
        console.error("Failed to load doctor profile:", err);
        setError(err.message || "Unable to load profile.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const getDisplayName = (name = "") => {
    return (
      name.replace(/^dr\.?\s*/i, "").trim() || "Doctor"
    );
  };

  const getInitials = (name = "") => {
    const cleanName = getDisplayName(name);
    const words = cleanName.split(/\s+/);

    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }

    return (
      words[0].charAt(0) +
      words[words.length - 1].charAt(0)
    ).toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f9f9] p-6 md:p-8">
        <div className="max-w-6xl mx-auto animate-pulse">

          <div className="h-5 w-36 bg-slate-200 rounded mb-8" />

          <div className="bg-white border border-slate-200 rounded-2xl p-7">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-full bg-slate-200" />

              <div className="space-y-3">
                <div className="h-6 w-52 bg-slate-200 rounded" />
                <div className="h-4 w-36 bg-slate-200 rounded" />
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-5 mt-5">
            <div className="lg:col-span-2 h-72 bg-white rounded-2xl border border-slate-200" />
            <div className="h-72 bg-white rounded-2xl border border-slate-200" />
          </div>

        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f6f9f9] flex items-center justify-center p-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center max-w-md shadow-sm">

          <div className="w-12 h-12 mx-auto rounded-xl bg-red-50 flex items-center justify-center mb-4">
            <UserRound className="w-6 h-6 text-red-500" />
          </div>

          <h2 className="text-lg font-semibold text-slate-900">
            Unable to load profile
          </h2>

          <p className="text-sm text-slate-500 mt-2">
            {error}
          </p>

          <button
            onClick={() => navigate("/")}
            className="mt-6 px-4 py-2.5 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition"
          >
            Back to Dashboard
          </button>

        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-[#f6f9f9] flex items-center justify-center">
        <p className="text-slate-500">
          No profile information found.
        </p>
      </div>
    );
  }

  const displayName = getDisplayName(doctor.name);

  return (
    <div className="min-h-screen bg-[#f6f9f9] p-5 md:p-7">

      <div className="max-w-6xl mx-auto">

        {/* -----------------------------------------
            TOP BAR
        ----------------------------------------- */}
        <div className="flex items-center justify-between mb-6">

          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>

        </div>


        {/* -----------------------------------------
            PROFILE HEADER
        ----------------------------------------- */}
        <section className="bg-white border border-slate-200 rounded-2xl shadow-[0_2px_8px_rgba(15,23,42,0.03)]">

          <div className="px-6 md:px-8 py-7">

            <div className="flex flex-col md:flex-row md:items-center gap-5">

              {/* Avatar */}
              <div className="relative shrink-0">

                <div className="w-[82px] h-[82px] rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white text-2xl font-bold shadow-sm">
                  {getInitials(doctor.name)}
                </div>

                {doctor.isVerified && (
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center">
                    <BadgeCheck
                      className="w-5 h-5 text-teal-600"
                      fill="currentColor"
                      strokeWidth={1.5}
                    />
                  </div>
                )}

              </div>


              {/* Doctor identity */}
              <div className="flex-1 min-w-0">

                <div className="flex flex-wrap items-center gap-2">

                  <h1 className="text-[23px] font-semibold tracking-tight text-slate-900">
                    Dr. {displayName}
                  </h1>

                  {doctor.isVerified && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 text-[11px] font-semibold">
                      <BadgeCheck className="w-3.5 h-3.5" />
                      Verified Doctor
                    </span>
                  )}

                </div>

                <p className="text-sm text-slate-500 mt-1">
                  {doctor.specialization || "Medical Professional"}
                </p>

                <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-400">

                  {doctor.qualification && (
                    <span className="inline-flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5" />
                      {doctor.qualification}
                    </span>
                  )}

                  {doctor.experience && (
                    <span className="inline-flex items-center gap-1.5">
                      <BriefcaseMedical className="w-3.5 h-3.5" />
                      {doctor.experience} years experience
                    </span>
                  )}

                </div>

              </div>


              {/* Account status */}
              <div className="shrink-0">

                <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-50 border border-emerald-100">

                  <span className="w-2 h-2 rounded-full bg-emerald-500" />

                  <span className="text-xs font-semibold text-emerald-700">
                    Active Account
                  </span>

                </div>

              </div>

            </div>

          </div>

        </section>


        {/* -----------------------------------------
            MAIN CONTENT
        ----------------------------------------- */}
        <div className="grid lg:grid-cols-3 gap-5 mt-5">


          {/* ---------------------------------------
              LEFT — PROFESSIONAL
          --------------------------------------- */}
          <section className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-[0_2px_8px_rgba(15,23,42,0.03)]">

            <SectionHeader
              icon={<BriefcaseMedical />}
              title="Professional Information"
              subtitle="Your medical credentials and professional details"
            />

            <div className="px-6 pb-6">

              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-6">

                <InfoItem
                  icon={<BriefcaseMedical />}
                  label="Specialization"
                  value={doctor.specialization}
                />

                <InfoItem
                  icon={<GraduationCap />}
                  label="Qualification"
                  value={doctor.qualification}
                />

                <InfoItem
                  icon={<Clock3 />}
                  label="Experience"
                  value={
                    doctor.experience
                      ? `${doctor.experience} years`
                      : null
                  }
                />

                <InfoItem
                  icon={<Languages />}
                  label="Languages Spoken"
                  value={
                    Array.isArray(doctor.languagesSpoken)
                      ? doctor.languagesSpoken.join(", ")
                      : doctor.languagesSpoken
                  }
                />

                <InfoItem
                  icon={<FileCheck2 />}
                  label="Medical License"
                  value={
                    doctor.medicalLicense
                      ? "Document uploaded"
                      : "Not provided"
                  }
                />

                <InfoItem
                  icon={<CalendarDays />}
                  label="Availability"
                  value={
                    doctor.availability
                      ? formatAvailability(doctor.availability)
                      : "Not provided"
                  }
                />

              </div>

            </div>

          </section>


          {/* ---------------------------------------
              RIGHT — CONTACT
          --------------------------------------- */}
          <section className="bg-white border border-slate-200 rounded-2xl shadow-[0_2px_8px_rgba(15,23,42,0.03)]">

            <SectionHeader
              icon={<UserRound />}
              title="Contact Details"
              subtitle="Your registered contact information"
            />

            <div className="px-6 pb-6 space-y-5">

              <InfoItem
                icon={<Mail />}
                label="Email Address"
                value={doctor.email}
              />

              <InfoItem
                icon={<Phone />}
                label="Phone Number"
                value={doctor.phone}
              />

            </div>

          </section>

        </div>


        {/* -----------------------------------------
            ABOUT
        ----------------------------------------- */}
        {doctor.bio && (
          <section className="mt-5 bg-white border border-slate-200 rounded-2xl shadow-[0_2px_8px_rgba(15,23,42,0.03)]">

            <SectionHeader
              icon={<UserRound />}
              title="About"
              subtitle="Professional introduction"
            />

            <div className="px-6 pb-6">

              <p className="text-sm leading-7 text-slate-600 max-w-4xl">
                {doctor.bio}
              </p>

            </div>

          </section>
        )}

      </div>
    </div>
  );
}


/* =================================================
   SECTION HEADER
================================================= */

function SectionHeader({ icon, title, subtitle }) {
  return (
    <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100">

      <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-teal-600">
        <span className="[&>svg]:w-[18px] [&>svg]:h-[18px]">
          {icon}
        </span>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-slate-900">
          {title}
        </h2>

        <p className="text-xs text-slate-400 mt-0.5">
          {subtitle}
        </p>
      </div>

    </div>
  );
}


/* =================================================
   INFORMATION ITEM
================================================= */

function InfoItem({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">

      <div className="w-9 h-9 shrink-0 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
        <span className="[&>svg]:w-[17px] [&>svg]:h-[17px]">
          {icon}
        </span>
      </div>

      <div className="min-w-0 pt-0.5">

        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="text-sm font-medium text-slate-700 mt-1 break-words">
          {value || "Not provided"}
        </p>

      </div>

    </div>
  );
}


/* =================================================
   AVAILABILITY FORMATTER
================================================= */

function formatAvailability(availability) {
  if (!availability) return "Not provided";

  if (typeof availability === "string") {
    return availability;
  }

  if (Array.isArray(availability)) {
    return availability
      .map((item) => {
        if (typeof item === "string") return item;

        if (item?.day) {
          return item.day;
        }

        return "";
      })
      .filter(Boolean)
      .join(", ");
  }

  if (typeof availability === "object") {
    const days = Object.keys(availability);

    if (days.length > 0) {
      return days.join(", ");
    }
  }

  return "Available";
}

export default DoctorProfile;