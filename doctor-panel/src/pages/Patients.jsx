import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";

import {
  Search,
  X,
  ChevronRight,
  FileText,
  Download,
  Users,
  UserRound,
  CalendarDays,
  Clock3,
  CheckCircle2,
  CircleAlert,
  UserCheck,
  Stethoscope,
  Droplets,
  Activity,
  ClipboardList,
  Video,
} from "lucide-react";

import {
  fetchDoctorProfile,
  fetchDoctorPatients,
  assignConsultation,
  updateAppointmentStatus,
} from "../api/api";


export default function Patients() {

  const [isExpanded, setIsExpanded] = useState(false);
  const [doctor, setDoctor] = useState(null);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);

  const [showAssignForm, setShowAssignForm] = useState(false);

  const [assignData, setAssignData] = useState({
    date: "",
    timeSlot: "",
    meetingLink: "",
  });

  const [assigning, setAssigning] = useState(false);


  /* =================================================
     LOAD DATA
  ================================================= */

  useEffect(() => {

    const load = async () => {

      try {

        const [
          profileRes,
          patientsRes,
        ] = await Promise.all([
          fetchDoctorProfile(),
          fetchDoctorPatients(),
        ]);

        setDoctor(profileRes);
        setPatients(patientsRes);

      } catch (err) {

        console.error(
          "Patients load error:",
          err
        );

      } finally {

        setLoading(false);

      }

    };

    load();

  }, []);


  /* =================================================
     SEARCH
  ================================================= */

  const filtered = patients.filter((patient) => {

    const query =
      searchTerm.toLowerCase().trim();

    if (!query) return true;

    return (
      patient.name
        ?.toLowerCase()
        .includes(query) ||

      patient.patientDisplayId
        ?.toLowerCase()
        .includes(query)
    );

  });


  /* =================================================
     STATUS CONFIG
  ================================================= */

  const consultationStatusConfig = {

    done: {
      label: "Consulted",
      className:
        "bg-slate-50 text-slate-600 border-slate-200",
      icon: CheckCircle2,
    },

    assigned: {
      label: "Assigned",
      className:
        "bg-teal-50 text-teal-700 border-teal-100",
      icon: UserCheck,
    },

    pending: {
      label: "Pending",
      className:
        "bg-amber-50 text-amber-700 border-amber-100",
      icon: CircleAlert,
    },

    unassigned: {
      label: "Unassigned",
      className:
        "bg-red-50 text-red-600 border-red-100",
      icon: CircleAlert,
    },

  };


  /* =================================================
     ASSIGN CONSULTATION
  ================================================= */

  const handleAssign = async () => {

    if (
      !assignData.date ||
      !assignData.timeSlot
    ) {

      alert(
        "Please provide date and time slot."
      );

      return;

    }

    const apptId =
      selectedPatient
        ?.latestAppointment
        ?.appointmentId;

    if (!apptId) return;

    setAssigning(true);

    try {

      await assignConsultation(
        apptId,
        assignData
      );

      const updated =
        await fetchDoctorPatients();

      setPatients(updated);

      const updatedPatient =
        updated.find(
          (patient) =>
            String(patient.patientId) ===
            String(selectedPatient.patientId)
        );

      if (updatedPatient) {
        setSelectedPatient(
          updatedPatient
        );
      }

      setShowAssignForm(false);

      setAssignData({
        date: "",
        timeSlot: "",
        meetingLink: "",
      });

    } catch (err) {

      console.error(err);

      alert(
        "Failed to assign consultation."
      );

    } finally {

      setAssigning(false);

    }

  };


  /* =================================================
     MARK APPOINTMENT DONE
  ================================================= */

  const handleMarkDone = async (
    appointmentId
  ) => {

    try {

      await updateAppointmentStatus(
        appointmentId,
        "completed"
      );

      const updated =
        await fetchDoctorPatients();

      setPatients(updated);

      const updatedPatient =
        updated.find(
          (patient) =>
            String(patient.patientId) ===
            String(selectedPatient.patientId)
        );

      if (updatedPatient) {
        setSelectedPatient(
          updatedPatient
        );
      }

    } catch (err) {

      console.error(err);

      alert(
        "Failed to update status."
      );

    }

  };


  /* =================================================
     COUNTS
  ================================================= */

  const totalPatients =
    patients.length;

  const consultedPatients =
    patients.filter(
      (p) =>
        p.consultationStatus === "done"
    ).length;

  const pendingPatients =
    patients.filter(
      (p) =>
        p.consultationStatus === "pending"
    ).length;


  /* =================================================
     DATE
  ================================================= */

  const today =
    new Date().toLocaleDateString(
      "en-US",
      {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }
    );


  return (

    <div className="min-h-screen bg-[#f5f8f8]">

      {/* Sidebar */}

      <Sidebar
        doctor={doctor}
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
      />


      {/* Main */}

      <main
        className={`
          min-h-screen
          transition-all
          duration-300
          ease-in-out
          ${isExpanded
            ? "ml-64"
            : "ml-[76px]"
          }
        `}
      >

        <div className="max-w-[1500px] mx-auto px-5 py-6 md:px-7 lg:px-8">


          {/* =========================================
              HEADER
          ========================================= */}

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">

            <div>

              <p className="text-[11px] uppercase tracking-[0.16em] font-semibold text-teal-600">
                Doctor Dashboard
              </p>

              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 mt-1">
                Patients
              </h1>

              <p className="text-sm text-slate-500 mt-1">
                Manage and review your patient records.
              </p>

            </div>


            <div className="flex items-center gap-2 text-xs text-slate-400">

              <CalendarDays className="w-4 h-4" />

              {today}

            </div>

          </div>


          {/* =========================================
              SUMMARY
          ========================================= */}

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-5">

            <SummaryCard
              label="Total Patients"
              value={
                loading
                  ? "—"
                  : totalPatients
              }
              icon={<Users />}
              iconClass="bg-blue-50 text-blue-600"
            />

            <SummaryCard
              label="Consulted"
              value={
                loading
                  ? "—"
                  : consultedPatients
              }
              icon={<CheckCircle2 />}
              iconClass="bg-emerald-50 text-emerald-600"
            />

            <SummaryCard
              label="Pending Consultation"
              value={
                loading
                  ? "—"
                  : pendingPatients
              }
              icon={<Clock3 />}
              iconClass="bg-amber-50 text-amber-600"
            />

          </div>


          {/* =========================================
              SEARCH
          ========================================= */}

          <div className="bg-white border border-slate-200 rounded-xl shadow-[0_2px_8px_rgba(15,23,42,0.03)] p-3 mb-5">

            <div className="relative w-full md:max-w-sm">

              <Search
                className="
                  absolute
                  left-3
                  top-1/2
                  -translate-y-1/2
                  w-4
                  h-4
                  text-slate-400
                "
              />

              <input
                type="text"
                placeholder="Search by patient name or ID..."
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(
                    e.target.value
                  )
                }
                className="
                  w-full
                  h-10
                  pl-9
                  pr-4
                  rounded-lg
                  border
                  border-slate-200
                  bg-slate-50
                  text-sm
                  text-slate-700
                  placeholder:text-slate-400
                  outline-none
                  focus:bg-white
                  focus:border-teal-300
                  focus:ring-2
                  focus:ring-teal-50
                  transition
                "
              />

            </div>

          </div>


          {/* =========================================
              PATIENT TABLE
          ========================================= */}

          <div className="bg-white border border-slate-200 rounded-2xl shadow-[0_2px_10px_rgba(15,23,42,0.035)] overflow-hidden">


            {/* Table Header */}

            <div className="hidden lg:grid grid-cols-[1.2fr_2fr_0.8fr_0.9fr_1.3fr_0.7fr] gap-4 px-6 py-3.5 bg-slate-50/70 border-b border-slate-100">

              <TableHeader>
                Patient ID
              </TableHeader>

              <TableHeader>
                Patient
              </TableHeader>

              <TableHeader>
                Age
              </TableHeader>

              <TableHeader>
                Gender
              </TableHeader>

              <TableHeader>
                Consultation
              </TableHeader>

              <TableHeader>
                Action
              </TableHeader>

            </div>


            {/* Loading */}

            {loading && (

              <div>

                {[1, 2, 3, 4].map(
                  (item) => (

                    <PatientSkeleton
                      key={item}
                    />

                  )
                )}

              </div>

            )}


            {/* Empty */}

            {!loading &&
              filtered.length === 0 && (

                <div className="px-6 py-16 text-center">

                  <div className="w-12 h-12 mx-auto rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">

                    <Users className="w-5 h-5 text-slate-400" />

                  </div>

                  <h3 className="text-sm font-semibold text-slate-800 mt-4">
                    No patients found
                  </h3>

                  <p className="text-xs text-slate-400 mt-1">
                    {searchTerm
                      ? "Try a different name or patient ID."
                      : "There are no patient records available."}
                  </p>

                </div>

              )}


            {/* Rows */}

            {!loading &&
              filtered.map(
                (patient) => {

                  const statusCfg =
                    consultationStatusConfig[
                      patient.consultationStatus
                    ] ||
                    consultationStatusConfig.unassigned;

                  return (

                    <PatientRow
                      key={String(
                        patient.patientId
                      )}
                      patient={patient}
                      statusCfg={statusCfg}
                      onClick={() =>
                        setSelectedPatient(
                          patient
                        )
                      }
                    />

                  );

                }
              )}

          </div>


          {!loading &&
            filtered.length > 0 && (

              <p className="text-xs text-slate-400 mt-3 px-1">

                Showing{" "}
                {filtered.length}{" "}
                {filtered.length === 1
                  ? "patient"
                  : "patients"}

              </p>

            )}

        </div>

      </main>


      {/* ===========================================
          PATIENT DRAWER
      =========================================== */}

      {selectedPatient && (

        <PatientDrawer
          patient={selectedPatient}
          consultationStatusConfig={
            consultationStatusConfig
          }
          showAssignForm={
            showAssignForm
          }
          setShowAssignForm={
            setShowAssignForm
          }
          assignData={assignData}
          setAssignData={
            setAssignData
          }
          assigning={assigning}
          handleAssign={
            handleAssign
          }
          handleMarkDone={
            handleMarkDone
          }
          onClose={() => {
            setSelectedPatient(
              null
            );
            setShowAssignForm(
              false
            );
          }}
        />

      )}

    </div>

  );
}


/* =================================================
   SUMMARY CARD
================================================= */

function SummaryCard({
  label,
  value,
  icon,
  iconClass,
}) {

  return (

    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-[0_2px_8px_rgba(15,23,42,0.025)]">

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

          <span className="[&>svg]:w-[17px] [&>svg]:h-[17px]">
            {icon}
          </span>

        </div>

      </div>

    </div>

  );

}


/* =================================================
   TABLE HEADER
================================================= */

function TableHeader({
  children,
}) {

  return (

    <div className="text-[10px] uppercase tracking-[0.08em] font-semibold text-slate-400">
      {children}
    </div>

  );

}


/* =================================================
   PATIENT ROW
================================================= */

function PatientRow({
  patient,
  statusCfg,
  onClick,
}) {

  return (

    <div
      onClick={onClick}
      className="
        group
        border-b
        border-slate-100
        last:border-b-0
        hover:bg-slate-50/60
        transition-colors
        cursor-pointer
      "
    >

      {/* Desktop */}

      <div className="hidden lg:grid grid-cols-[1.2fr_2fr_0.8fr_0.9fr_1.3fr_0.7fr] gap-4 items-center px-6 py-4">


        <div className="text-xs font-medium text-slate-500">
          {patient.patientDisplayId ||
            "—"}
        </div>


        <div className="flex items-center gap-3 min-w-0">

          <PatientAvatar
            name={patient.name}
          />

          <div className="min-w-0">

            <p className="text-sm font-semibold text-slate-800 truncate">
              {patient.name ||
                "Unknown Patient"}
            </p>

            <p className="text-[11px] text-slate-400 mt-0.5">
              Patient record
            </p>

          </div>

        </div>


        <div className="text-xs text-slate-600">
          {patient.age ?? "—"}
        </div>


        <div className="text-xs text-slate-600 capitalize">
          {patient.gender ?? "—"}
        </div>


        <StatusBadge
          config={statusCfg}
        />


        <div className="flex justify-end">

          <div className="
            w-8
            h-8
            rounded-lg
            flex
            items-center
            justify-center
            text-slate-300
            group-hover:text-teal-600
            group-hover:bg-teal-50
            transition-all
          ">

            <ChevronRight className="w-4 h-4" />

          </div>

        </div>

      </div>


      {/* Mobile */}

      <div className="lg:hidden p-4">

        <div className="flex items-center gap-3">

          <PatientAvatar
            name={patient.name}
          />

          <div className="flex-1 min-w-0">

            <div className="flex items-center justify-between gap-3">

              <p className="text-sm font-semibold text-slate-800 truncate">
                {patient.name ||
                  "Unknown Patient"}
              </p>

              <StatusBadge
                config={statusCfg}
              />

            </div>

            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5">

              <span className="text-xs text-slate-400">
                {patient.patientDisplayId}
              </span>

              {patient.age != null && (
                <span className="text-xs text-slate-400">
                  {patient.age} yrs
                </span>
              )}

              {patient.gender && (
                <span className="text-xs text-slate-400 capitalize">
                  {patient.gender}
                </span>
              )}

            </div>

          </div>

          <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />

        </div>

      </div>

    </div>

  );

}


/* =================================================
   PATIENT AVATAR
================================================= */

function PatientAvatar({
  name = "",
}) {

  const words =
    name.trim().split(/\s+/);

  const initials =
    words.length > 1
      ? `${words[0]?.[0] || ""}${words[words.length - 1]?.[0] || ""}`
      : words[0]?.[0] || "P";

  return (

    <div className="
      w-9
      h-9
      shrink-0
      rounded-full
      bg-slate-100
      border
      border-slate-200
      flex
      items-center
      justify-center
      text-xs
      font-semibold
      text-slate-600
    ">

      {initials.toUpperCase()}

    </div>

  );

}


/* =================================================
   STATUS BADGE
================================================= */

function StatusBadge({
  config,
}) {

  const Icon = config.icon;

  return (

    <span
      className={`
        inline-flex
        items-center
        gap-1.5
        w-fit
        px-2.5
        py-1
        rounded-full
        border
        text-[10px]
        font-semibold
        ${config.className}
      `}
    >

      <Icon className="w-3 h-3" />

      {config.label}

    </span>

  );

}


/* =================================================
   SKELETON
================================================= */

function PatientSkeleton() {

  return (

    <div className="px-6 py-5 border-b border-slate-100 animate-pulse">

      <div className="flex items-center gap-4">

        <div className="w-9 h-9 rounded-full bg-slate-100" />

        <div className="flex-1 space-y-2">

          <div className="h-3 w-36 bg-slate-100 rounded" />

          <div className="h-2.5 w-24 bg-slate-100 rounded" />

        </div>

        <div className="h-6 w-20 bg-slate-100 rounded-full" />

      </div>

    </div>

  );

}


/* =================================================
   PATIENT DRAWER
================================================= */

function PatientDrawer({
  patient,
  consultationStatusConfig,
  showAssignForm,
  setShowAssignForm,
  assignData,
  setAssignData,
  assigning,
  handleAssign,
  handleMarkDone,
  onClose,
}) {

  const statusCfg =
    consultationStatusConfig[
      patient.consultationStatus
    ] ||
    consultationStatusConfig.unassigned;


  return (

    <div
      className="
        fixed
        inset-0
        z-[100]
        bg-slate-950/40
        backdrop-blur-[2px]
      "
      onClick={onClose}
    >

      <div
        className="
          absolute
          top-0
          right-0
          h-full
          w-full
          max-w-xl
          bg-white
          shadow-[-15px_0_50px_rgba(15,23,42,0.12)]
          flex
          flex-col
        "
        onClick={(e) =>
          e.stopPropagation()
        }
      >


        {/* =====================================
            DRAWER HEADER
        ===================================== */}

        <div className="
          shrink-0
          px-6
          py-5
          border-b
          border-slate-100
          bg-white
        ">

          <div className="flex items-start justify-between gap-4">

            <div className="flex items-center gap-3">

              <PatientAvatar
                name={patient.name}
              />

              <div>

                <h2 className="text-base font-semibold text-slate-900">
                  {patient.name}
                </h2>

                <p className="text-xs text-slate-400 mt-0.5">
                  Patient #{patient.patientDisplayId || "—"}
                </p>

              </div>

            </div>


            <button
              onClick={onClose}
              className="
                w-8
                h-8
                rounded-lg
                flex
                items-center
                justify-center
                text-slate-400
                hover:text-slate-700
                hover:bg-slate-50
                transition
              "
            >

              <X className="w-4 h-4" />

            </button>

          </div>

        </div>


        {/* =====================================
            DRAWER BODY
        ===================================== */}

        <div className="flex-1 overflow-y-auto p-6">


          {/* Consultation status */}

          <div className="
            flex
            items-center
            justify-between
            gap-3
            px-4
            py-3
            rounded-xl
            bg-slate-50
            border
            border-slate-100
          ">

            <div className="flex items-center gap-2">

              <span className="text-xs font-medium text-slate-500">
                Consultation
              </span>

              <StatusBadge
                config={statusCfg}
              />

            </div>


            {patient.latestAppointment && (

              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">

                <CalendarDays className="w-3.5 h-3.5" />

                {patient.latestAppointment.date}

                <span>·</span>

                {patient.latestAppointment.timeSlot}

              </div>

            )}

          </div>


          {/* =====================================
              PATIENT INFORMATION
          ===================================== */}

          <DrawerSection
            icon={<UserRound />}
            title="Patient Information"
            subtitle="Basic patient details"
          >

            <div className="grid grid-cols-2 gap-4">

              <DetailItem
                icon={<UserRound />}
                label="Age"
                value={
                  patient.age != null
                    ? `${patient.age} years`
                    : "—"
                }
              />

              <DetailItem
                icon={<UserRound />}
                label="Gender"
                value={
                  patient.gender || "—"
                }
              />

              <DetailItem
                icon={<Droplets />}
                label="Blood Group"
                value={
                  patient.bloodGroup ||
                  "—"
                }
              />

              <DetailItem
                icon={<Activity />}
                label="Chronic Disease"
                value={
                  patient.hasChronicDisease != null
                    ? patient.hasChronicDisease
                      ? "Yes"
                      : "No"
                    : "—"
                }
              />

            </div>


            {patient.hasChronicDisease &&
              patient.chronicDiseaseDetail && (

                <div className="mt-4">

                  <DetailBlock
                    label="Chronic Disease Details"
                    value={
                      patient.chronicDiseaseDetail
                    }
                  />

                </div>

              )}

          </DrawerSection>


          {/* =====================================
              MEDICAL DETAILS
          ===================================== */}

          <DrawerSection
            icon={<Stethoscope />}
            title="Medical Details"
            subtitle="Available clinical information"
          >

            <DetailBlock
              label="AI Prediction / Diagnosis"
              value={
                patient.aiDiagnosis ||
                "Not available"
              }
            />


            {patient.latestAppointment?.notes && (

              <div className="mt-4">

                <DetailBlock
                  label="Symptoms / Notes"
                  value={
                    patient.latestAppointment
                      .notes
                  }
                />

              </div>

            )}

          </DrawerSection>


          {/* =====================================
              APPOINTMENT HISTORY
          ===================================== */}

          {patient.appointments?.length > 0 && (

            <DrawerSection
              icon={<ClipboardList />}
              title={`Appointment History (${patient.appointments.length})`}
              subtitle="Previous consultations"
            >

              <div className="space-y-2">

                {patient.appointments.map(
                  (appointment) => (

                    <AppointmentHistoryItem
                      key={String(
                        appointment.appointmentId
                      )}
                      appointment={
                        appointment
                      }
                      onMarkDone={
                        handleMarkDone
                      }
                    />

                  )
                )}

              </div>

            </DrawerSection>

          )}


          {/* =====================================
              MEDICAL RECORDS
          ===================================== */}

          <DrawerSection
            icon={<FileText />}
            title="Medical Records"
            subtitle="Consultation records"
          >

            <MedicalRecords
              patientId={
                patient.patientId
              }
              patientDisplayId={
                patient.patientDisplayId
              }
            />

          </DrawerSection>


          {/* =====================================
              ASSIGN CONSULTATION
          ===================================== */}

          {patient.consultationStatus ===
            "pending" &&
            !showAssignForm && (

              <button
                onClick={() =>
                  setShowAssignForm(
                    true
                  )
                }
                className="
                  w-full
                  h-10
                  rounded-lg
                  bg-teal-600
                  text-white
                  text-xs
                  font-semibold
                  hover:bg-teal-700
                  transition
                "
              >

                Assign Consultation Slot

              </button>

            )}


          {showAssignForm && (

            <div className="
              mt-5
              rounded-xl
              border
              border-slate-200
              bg-slate-50/60
              p-5
            ">

              <div className="flex items-center gap-2 mb-4">

                <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
                  <CalendarDays className="w-4 h-4 text-teal-600" />
                </div>

                <div>

                  <p className="text-sm font-semibold text-slate-800">
                    Assign Consultation
                  </p>

                  <p className="text-[11px] text-slate-400">
                    Schedule the patient's consultation.
                  </p>

                </div>

              </div>


              <div className="space-y-4">

                <FormField label="Date">

                  <input
                    type="date"
                    value={assignData.date}
                    onChange={(e) =>
                      setAssignData(
                        (data) => ({
                          ...data,
                          date: e.target.value,
                        })
                      )
                    }
                    className="form-input"
                  />

                </FormField>


                <FormField label="Time Slot">

                  <input
                    type="text"
                    placeholder="10:00 - 11:00"
                    value={
                      assignData.timeSlot
                    }
                    onChange={(e) =>
                      setAssignData(
                        (data) => ({
                          ...data,
                          timeSlot:
                            e.target.value,
                        })
                      )
                    }
                    className="form-input"
                  />

                </FormField>


                <FormField label="Meeting Link (optional)">

                  <div className="relative">

                    <Video className="
                      absolute
                      left-3
                      top-1/2
                      -translate-y-1/2
                      w-4
                      h-4
                      text-slate-400
                    " />

                    <input
                      type="text"
                      placeholder="https://meet.google.com/..."
                      value={
                        assignData.meetingLink
                      }
                      onChange={(e) =>
                        setAssignData(
                          (data) => ({
                            ...data,
                            meetingLink:
                              e.target.value,
                          })
                        )
                      }
                      className="form-input pl-9"
                    />

                  </div>

                </FormField>


                <div className="flex gap-2 pt-1">

                  <button
                    onClick={
                      handleAssign
                    }
                    disabled={assigning}
                    className="
                      flex-1
                      h-10
                      rounded-lg
                      bg-teal-600
                      text-white
                      text-xs
                      font-semibold
                      hover:bg-teal-700
                      disabled:opacity-50
                      transition
                    "
                  >

                    {assigning
                      ? "Assigning..."
                      : "Confirm & Assign"}

                  </button>


                  <button
                    onClick={() =>
                      setShowAssignForm(
                        false
                      )
                    }
                    className="
                      h-10
                      px-4
                      rounded-lg
                      border
                      border-slate-200
                      bg-white
                      text-slate-500
                      text-xs
                      font-medium
                      hover:bg-slate-50
                      transition
                    "
                  >

                    Cancel

                  </button>

                </div>

              </div>

            </div>

          )}

        </div>


        {/* =====================================
            DRAWER FOOTER
        ===================================== */}

        <div className="
          shrink-0
          px-6
          py-4
          border-t
          border-slate-100
          bg-white
        ">

          <button
            onClick={onClose}
            className="
              w-full
              h-10
              rounded-lg
              border
              border-slate-200
              text-slate-500
              text-xs
              font-medium
              hover:bg-slate-50
              hover:text-slate-700
              transition
            "
          >

            Close

          </button>

        </div>

      </div>

    </div>

  );

}


/* =================================================
   DRAWER SECTION
================================================= */

function DrawerSection({
  icon,
  title,
  subtitle,
  children,
}) {

  return (

    <section className="mt-6">

      <div className="flex items-center gap-2.5 mb-4">

        <div className="
          w-8
          h-8
          rounded-lg
          bg-slate-50
          border
          border-slate-100
          flex
          items-center
          justify-center
          text-teal-600
        ">

          <span className="[&>svg]:w-4 [&>svg]:h-4">
            {icon}
          </span>

        </div>

        <div>

          <h3 className="text-sm font-semibold text-slate-800">
            {title}
          </h3>

          <p className="text-[11px] text-slate-400 mt-0.5">
            {subtitle}
          </p>

        </div>

      </div>

      {children}

    </section>

  );

}


/* =================================================
   DETAIL ITEM
================================================= */

function DetailItem({
  icon,
  label,
  value,
}) {

  return (

    <div className="flex items-center gap-3">

      <div className="
        w-8
        h-8
        shrink-0
        rounded-lg
        bg-slate-50
        border
        border-slate-100
        flex
        items-center
        justify-center
        text-slate-400
      ">

        <span className="[&>svg]:w-4 [&>svg]:h-4">
          {icon}
        </span>

      </div>

      <div className="min-w-0">

        <p className="text-[10px] uppercase tracking-wide font-medium text-slate-400">
          {label}
        </p>

        <p className="text-xs font-semibold text-slate-700 mt-0.5 truncate">
          {value}
        </p>

      </div>

    </div>

  );

}


/* =================================================
   DETAIL BLOCK
================================================= */

function DetailBlock({
  label,
  value,
}) {

  return (

    <div>

      <p className="text-[10px] uppercase tracking-wide font-semibold text-slate-400 mb-2">
        {label}
      </p>

      <div className="
        rounded-lg
        bg-slate-50
        border
        border-slate-100
        px-3.5
        py-3
      ">

        <p className="text-xs leading-5 text-slate-600">
          {value}
        </p>

      </div>

    </div>

  );

}


/* =================================================
   APPOINTMENT HISTORY
================================================= */

function AppointmentHistoryItem({
  appointment,
  onMarkDone,
}) {

  const getStatus = () => {

    if (appointment.status === "completed") {
      return {
        label: "Completed",
        className:
          "bg-slate-50 text-slate-600 border-slate-200",
      };
    }

    if (appointment.status === "confirmed") {
      return {
        label: "Confirmed",
        className:
          "bg-teal-50 text-teal-700 border-teal-100",
      };
    }

    if (appointment.status === "cancelled") {
      return {
        label: "Cancelled",
        className:
          "bg-red-50 text-red-600 border-red-100",
      };
    }

    return {
      label: "Pending",
      className:
        "bg-amber-50 text-amber-700 border-amber-100",
    };

  };


  const status =
    getStatus();


  return (

    <div className="
      rounded-xl
      border
      border-slate-100
      bg-slate-50/60
      px-4
      py-3
    ">

      <div className="flex items-center justify-between gap-3">

        <div className="min-w-0">

          <p className="text-xs font-semibold text-slate-700">
            {appointment.date}
          </p>

          <p className="text-[11px] text-slate-400 mt-1">
            {appointment.timeSlot}
            {appointment.consultationType
              ? ` · ${appointment.consultationType}`
              : ""}
          </p>

        </div>


        <div className="flex items-center gap-2 shrink-0">

          <span
            className={`
              px-2
              py-1
              rounded-full
              border
              text-[10px]
              font-semibold
              ${status.className}
            `}
          >

            {status.label}

          </span>


          {appointment.status ===
            "confirmed" && (

              <button
                onClick={() =>
                  onMarkDone(
                    appointment.appointmentId
                  )
                }
                className="
                  text-[10px]
                  font-semibold
                  text-teal-600
                  hover:text-teal-700
                "
              >

                Mark done

              </button>

            )}

        </div>

      </div>

    </div>

  );

}


/* =================================================
   FORM FIELD
================================================= */

function FormField({
  label,
  children,
}) {

  return (

    <div>

      <label className="
        block
        text-[10px]
        uppercase
        tracking-wide
        font-semibold
        text-slate-400
        mb-1.5
      ">

        {label}

      </label>

      {children}

    </div>

  );

}


/* =================================================
   MEDICAL RECORDS
================================================= */

function MedicalRecords({
  patientId,
  patientDisplayId,
}) {

  const [records, setRecords] =
    useState([]);

  const [open, setOpen] =
    useState(false);


  useEffect(() => {

    try {

      const stored =
        JSON.parse(
          localStorage.getItem(
            "consultation_records"
          ) || "[]"
        );

      setRecords(
        stored.filter(
          (record) =>
            String(record.patientId) ===
            String(patientId)
        )
      );

    } catch {

      setRecords([]);

    }

  }, [patientId, open]);


  return (

    <div>

      <button
        onClick={() =>
          setOpen((value) => !value)
        }
        className="
          w-full
          flex
          items-center
          justify-between
          rounded-lg
          px-3
          py-2.5
          bg-slate-50
          border
          border-slate-100
          hover:bg-slate-100/70
          transition
        "
      >

        <div className="flex items-center gap-2">

          <FileText className="w-4 h-4 text-slate-400" />

          <span className="text-xs font-medium text-slate-600">
            Medical Records
          </span>

          <span className="text-[10px] text-slate-400">
            ({records.length})
          </span>

        </div>


        <ChevronRight
          className={`
            w-4
            h-4
            text-slate-400
            transition-transform
            ${open
              ? "rotate-90"
              : ""}
          `}
        />

      </button>


      {open && (

        <div className="mt-2 space-y-2">

          {records.length === 0 ? (

            <div className="
              rounded-xl
              bg-slate-50
              border
              border-slate-100
              px-4
              py-5
              text-center
            ">

              <FileText className="
                w-5
                h-5
                text-slate-300
                mx-auto
                mb-2
              " />

              <p className="text-xs text-slate-500">
                No consultation records saved yet.
              </p>

              <p className="text-[11px] text-slate-400 mt-1">
                Records saved during video consultation will appear here.
              </p>

            </div>

          ) : (

            records.map(
              (record, index) => (

                <div
                  key={index}
                  className="
                    rounded-xl
                    border
                    border-slate-100
                    bg-slate-50/60
                    px-4
                    py-3
                  "
                >

                  <div className="
                    flex
                    items-center
                    justify-between
                    gap-3
                    mb-2
                  ">

                    <p className="text-xs font-semibold text-slate-700">
                      {record.date}
                    </p>


                    <button
                      onClick={() => {

                        const blob =
                          new Blob(
                            [
                              JSON.stringify(
                                record,
                                null,
                                2
                              ),
                            ],
                            {
                              type:
                                "application/json",
                            }
                          );

                        const url =
                          URL.createObjectURL(
                            blob
                          );

                        const a =
                          document.createElement(
                            "a"
                          );

                        a.href = url;

                        a.download =
                          `record_${patientDisplayId}_${record.date}.json`;

                        a.click();

                        URL.revokeObjectURL(
                          url
                        );

                      }}
                      className="
                        flex
                        items-center
                        gap-1
                        text-[10px]
                        font-semibold
                        text-teal-600
                        hover:text-teal-700
                      "
                    >

                      <Download className="w-3 h-3" />

                      Download

                    </button>

                  </div>


                  {record.diagnosis && (

                    <p className="text-[11px] text-slate-500 mt-1">
                      <span className="font-semibold text-slate-600">
                        Diagnosis:
                      </span>{" "}
                      {record.diagnosis}
                    </p>

                  )}


                  {record.notes && (

                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                      <span className="font-semibold text-slate-600">
                        Notes:
                      </span>{" "}
                      {record.notes}
                    </p>

                  )}


                  {record.followUp && (

                    <p className="text-[11px] text-slate-500 mt-1">
                      <span className="font-semibold text-slate-600">
                        Follow-up:
                      </span>{" "}
                      {record.followUp}
                    </p>

                  )}

                </div>

              )
            )

          )}

        </div>

      )}

    </div>

  );

}