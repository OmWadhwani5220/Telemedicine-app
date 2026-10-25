import { useState } from "react";
import Sidebar from "../components/Sidebar";

import {
  FileText,
  Upload,
  Plus,
  Trash2,
  UserRound,
  Stethoscope,
  Pill,
  ClipboardList,
  Paperclip,
  FileImage,
  File,
  CalendarDays,
  CheckCircle2,
} from "lucide-react";

export default function PrescriptionUpload() {
  const [isExpanded, setIsExpanded] = useState(false);

  const [formData, setFormData] = useState({
    patientId: "",
    diagnosis: "",
    notes: "",
  });

  const [medicines, setMedicines] = useState([
    {
      name: "",
      dosage: "",
      frequency: "",
      duration: "",
    },
  ]);

  const [files, setFiles] = useState([]);

  const handleMedicineChange = (
    index,
    field,
    value
  ) => {
    const updated = [...medicines];

    updated[index][field] = value;

    setMedicines(updated);
  };

  const addMedicineRow = () => {
    setMedicines([
      ...medicines,
      {
        name: "",
        dosage: "",
        frequency: "",
        duration: "",
      },
    ]);
  };

  const removeMedicineRow = (index) => {
    if (medicines.length === 1) return;

    setMedicines(
      medicines.filter(
        (_, medicineIndex) =>
          medicineIndex !== index
      )
    );
  };

  const handleFileUpload = (e) => {
    const selectedFiles = Array.from(
      e.target.files || []
    );

    setFiles(selectedFiles);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      medicines,
      files,
    };

    console.log(
      "Prescription Data:",
      payload
    );

    alert(
      "Prescription submitted (Backend integration pending)"
    );
  };

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

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <Sidebar
        doctor={null}
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
      />


      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <main
        className={`
          min-h-screen
          transition-all
          duration-300
          ease-in-out
          ${
            isExpanded
              ? "ml-64"
              : "ml-[76px]"
          }
        `}
      >

        <div className="max-w-[1200px] mx-auto px-5 py-6 md:px-7 lg:px-8">


          {/* =================================================
              HEADER
          ================================================= */}

          <div className="
            flex
            flex-col
            lg:flex-row
            lg:items-end
            lg:justify-between
            gap-4
            mb-6
          ">

            <div>

              <p className="
                text-[11px]
                uppercase
                tracking-[0.16em]
                font-semibold
                text-teal-600
              ">
                Doctor Dashboard
              </p>


              <div className="flex items-center gap-2 mt-1">

                <h1 className="
                  text-2xl
                  font-semibold
                  tracking-tight
                  text-slate-900
                ">
                  Prescription & Records
                </h1>

              </div>


              <p className="
                text-sm
                text-slate-500
                mt-1
              ">
                Create prescription details and attach supporting medical records.
              </p>

            </div>


            <div className="
              flex
              items-center
              gap-2
              text-xs
              text-slate-400
            ">

              <CalendarDays className="w-4 h-4" />

              {today}

            </div>

          </div>


          {/* =================================================
              INFORMATION NOTICE
          ================================================= */}

          <div className="
            flex
            items-start
            gap-3
            px-4
            py-3.5
            mb-5
            rounded-xl
            bg-blue-50/70
            border
            border-blue-100
          ">

            <div className="
              w-8
              h-8
              shrink-0
              rounded-lg
              bg-white
              border
              border-blue-100
              flex
              items-center
              justify-center
            ">

              <FileText className="
                w-4
                h-4
                text-blue-600
              " />

            </div>


            <div>

              <p className="
                text-xs
                font-semibold
                text-blue-900
              ">
                Prescription workspace
              </p>

              <p className="
                text-[11px]
                leading-5
                text-blue-700/70
                mt-0.5
              ">
                Add the patient's prescription information and attach relevant medical reports before submitting.
              </p>

            </div>

          </div>


          {/* =================================================
              FORM
          ================================================= */}

          <form onSubmit={handleSubmit} className="space-y-5">


            {/* =================================================
                PATIENT & DIAGNOSIS
            ================================================= */}

            <section className="
              bg-white
              border
              border-slate-200
              rounded-2xl
              shadow-[0_2px_10px_rgba(15,23,42,0.035)]
              overflow-hidden
            ">

              <SectionHeader
                icon={<UserRound />}
                title="Patient Information"
                subtitle="Identify the patient and consultation diagnosis."
                iconClass="bg-blue-50 text-blue-600"
              />


              <div className="
                p-5
                md:p-6
                grid
                grid-cols-1
                md:grid-cols-2
                gap-5
              ">

                <FormField
                  label="Patient ID"
                  required
                >

                  <div className="relative">

                    <UserRound className="
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
                      value={
                        formData.patientId
                      }
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          patientId:
                            e.target.value,
                        })
                      }
                      placeholder="Enter patient ID"
                      required
                      className="form-input pl-9"
                    />

                  </div>

                </FormField>


                <FormField
                  label="Diagnosis"
                  required
                >

                  <div className="relative">

                    <Stethoscope className="
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
                      value={
                        formData.diagnosis
                      }
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          diagnosis:
                            e.target.value,
                        })
                      }
                      placeholder="Enter diagnosis"
                      required
                      className="form-input pl-9"
                    />

                  </div>

                </FormField>

              </div>

            </section>


            {/* =================================================
                MEDICINES
            ================================================= */}

            <section className="
              bg-white
              border
              border-slate-200
              rounded-2xl
              shadow-[0_2px_10px_rgba(15,23,42,0.035)]
              overflow-hidden
            ">

              <SectionHeader
                icon={<Pill />}
                title="Medicines"
                subtitle="Add the medicines and prescribed instructions."
                iconClass="bg-teal-50 text-teal-600"
              />


              <div className="p-5 md:p-6">

                {/* Column labels */}

                <div className="
                  hidden
                  lg:grid
                  grid-cols-[2fr_1.2fr_1.4fr_1.2fr_40px]
                  gap-3
                  px-1
                  mb-2
                ">

                  <FieldLabel>
                    Medicine Name
                  </FieldLabel>

                  <FieldLabel>
                    Dosage
                  </FieldLabel>

                  <FieldLabel>
                    Frequency
                  </FieldLabel>

                  <FieldLabel>
                    Duration
                  </FieldLabel>

                  <span />

                </div>


                {/* Medicine rows */}

                <div className="space-y-3">

                  {medicines.map(
                    (medicine, index) => (

                      <div
                        key={index}
                        className="
                          p-3
                          rounded-xl
                          border
                          border-slate-100
                          bg-slate-50/50
                        "
                      >

                        <div className="
                          grid
                          grid-cols-1
                          sm:grid-cols-2
                          lg:grid-cols-[2fr_1.2fr_1.4fr_1.2fr_40px]
                          gap-3
                          items-center
                        ">

                          <div>

                            <span className="lg:hidden field-label">
                              Medicine Name
                            </span>

                            <input
                              type="text"
                              placeholder="e.g. Paracetamol"
                              value={
                                medicine.name
                              }
                              onChange={(e) =>
                                handleMedicineChange(
                                  index,
                                  "name",
                                  e.target.value
                                )
                              }
                              className="form-input"
                              required
                            />

                          </div>


                          <div>

                            <span className="lg:hidden field-label">
                              Dosage
                            </span>

                            <input
                              type="text"
                              placeholder="e.g. 500 mg"
                              value={
                                medicine.dosage
                              }
                              onChange={(e) =>
                                handleMedicineChange(
                                  index,
                                  "dosage",
                                  e.target.value
                                )
                              }
                              className="form-input"
                              required
                            />

                          </div>


                          <div>

                            <span className="lg:hidden field-label">
                              Frequency
                            </span>

                            <input
                              type="text"
                              placeholder="e.g. Twice daily"
                              value={
                                medicine.frequency
                              }
                              onChange={(e) =>
                                handleMedicineChange(
                                  index,
                                  "frequency",
                                  e.target.value
                                )
                              }
                              className="form-input"
                              required
                            />

                          </div>


                          <div>

                            <span className="lg:hidden field-label">
                              Duration
                            </span>

                            <input
                              type="text"
                              placeholder="e.g. 5 days"
                              value={
                                medicine.duration
                              }
                              onChange={(e) =>
                                handleMedicineChange(
                                  index,
                                  "duration",
                                  e.target.value
                                )
                              }
                              className="form-input"
                              required
                            />

                          </div>


                          <button
                            type="button"
                            onClick={() =>
                              removeMedicineRow(
                                index
                              )
                            }
                            disabled={
                              medicines.length === 1
                            }
                            className="
                              w-10
                              h-10
                              rounded-lg
                              flex
                              items-center
                              justify-center
                              text-slate-400
                              hover:text-red-500
                              hover:bg-red-50
                              disabled:opacity-30
                              disabled:hover:bg-transparent
                              disabled:hover:text-slate-400
                              transition
                            "
                            title="Remove medicine"
                          >

                            <Trash2 className="w-4 h-4" />

                          </button>

                        </div>

                      </div>

                    )
                  )}

                </div>


                {/* Add medicine */}

                <button
                  type="button"
                  onClick={addMedicineRow}
                  className="
                    mt-4
                    inline-flex
                    items-center
                    gap-1.5
                    text-xs
                    font-semibold
                    text-teal-600
                    hover:text-teal-700
                    transition
                  "
                >

                  <span className="
                    w-6
                    h-6
                    rounded-md
                    bg-teal-50
                    flex
                    items-center
                    justify-center
                  ">

                    <Plus className="w-3.5 h-3.5" />

                  </span>

                  Add another medicine

                </button>

              </div>

            </section>


            {/* =================================================
                NOTES
            ================================================= */}

            <section className="
              bg-white
              border
              border-slate-200
              rounded-2xl
              shadow-[0_2px_10px_rgba(15,23,42,0.035)]
              overflow-hidden
            ">

              <SectionHeader
                icon={<ClipboardList />}
                title="Additional Notes"
                subtitle="Add instructions or relevant consultation notes."
                iconClass="bg-violet-50 text-violet-600"
              />


              <div className="p-5 md:p-6">

                <textarea
                  rows="5"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      notes: e.target.value,
                    })
                  }
                  placeholder="Enter additional comments, instructions or follow-up notes..."
                  className="
                    w-full
                    px-3.5
                    py-3
                    rounded-lg
                    border
                    border-slate-200
                    bg-slate-50
                    text-sm
                    text-slate-700
                    placeholder:text-slate-400
                    outline-none
                    resize-none
                    focus:bg-white
                    focus:border-teal-300
                    focus:ring-2
                    focus:ring-teal-50
                    transition
                  "
                />

              </div>

            </section>


            {/* =================================================
                FILE UPLOAD
            ================================================= */}

            <section className="
              bg-white
              border
              border-slate-200
              rounded-2xl
              shadow-[0_2px_10px_rgba(15,23,42,0.035)]
              overflow-hidden
            ">

              <SectionHeader
                icon={<Paperclip />}
                title="Medical Records"
                subtitle="Attach supporting reports, prescriptions or medical documents."
                iconClass="bg-amber-50 text-amber-600"
              />


              <div className="p-5 md:p-6">

                <label
                  htmlFor="medical-records"
                  className="
                    block
                    cursor-pointer
                    rounded-xl
                    border-2
                    border-dashed
                    border-slate-200
                    bg-slate-50/50
                    hover:bg-slate-50
                    hover:border-teal-300
                    transition
                  "
                >

                  <div className="
                    flex
                    flex-col
                    items-center
                    justify-center
                    py-9
                    px-5
                    text-center
                  ">

                    <div className="
                      w-12
                      h-12
                      rounded-xl
                      bg-white
                      border
                      border-slate-200
                      flex
                      items-center
                      justify-center
                      shadow-sm
                    ">

                      <Upload className="
                        w-5
                        h-5
                        text-teal-600
                      " />

                    </div>


                    <p className="
                      text-sm
                      font-semibold
                      text-slate-700
                      mt-4
                    ">
                      Upload medical records
                    </p>


                    <p className="
                      text-xs
                      text-slate-400
                      mt-1
                    ">
                      Click to choose PDF or image files
                    </p>


                    <span className="
                      inline-flex
                      items-center
                      gap-1.5
                      mt-3
                      px-2.5
                      py-1
                      rounded-full
                      bg-white
                      border
                      border-slate-200
                      text-[10px]
                      text-slate-400
                    ">

                      <FileText className="w-3 h-3" />

                      PDF / JPG / PNG

                    </span>

                  </div>

                  <input
                    id="medical-records"
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={
                      handleFileUpload
                    }
                    className="hidden"
                  />

                </label>


                {/* Selected files */}

                {files.length > 0 && (

                  <div className="mt-4">

                    <div className="
                      flex
                      items-center
                      justify-between
                      mb-2
                    ">

                      <p className="
                        text-[10px]
                        uppercase
                        tracking-wide
                        font-semibold
                        text-slate-400
                      ">
                        Selected Files
                      </p>

                      <span className="
                        text-[10px]
                        text-slate-400
                      ">
                        {files.length}{" "}
                        {files.length === 1
                          ? "file"
                          : "files"}
                      </span>

                    </div>


                    <div className="space-y-2">

                      {files.map(
                        (file, index) => (

                          <div
                            key={`${file.name}-${index}`}
                            className="
                              flex
                              items-center
                              gap-3
                              px-3
                              py-2.5
                              rounded-lg
                              bg-slate-50
                              border
                              border-slate-100
                            "
                          >

                            <div className="
                              w-8
                              h-8
                              rounded-lg
                              bg-white
                              border
                              border-slate-200
                              flex
                              items-center
                              justify-center
                            ">

                              {file.type?.includes(
                                "image"
                              ) ? (
                                <FileImage className="
                                  w-4
                                  h-4
                                  text-blue-500
                                " />
                              ) : (
                                <File className="
                                  w-4
                                  h-4
                                  text-red-500
                                " />
                              )}

                            </div>


                            <div className="
                              flex-1
                              min-w-0
                            ">

                              <p className="
                                text-xs
                                font-medium
                                text-slate-700
                                truncate
                              ">
                                {file.name}
                              </p>

                              <p className="
                                text-[10px]
                                text-slate-400
                                mt-0.5
                              ">
                                {formatFileSize(
                                  file.size
                                )}
                              </p>

                            </div>


                            <CheckCircle2 className="
                              w-4
                              h-4
                              text-emerald-500
                            " />

                          </div>

                        )
                      )}

                    </div>

                  </div>

                )}

              </div>

            </section>


            {/* =================================================
                SUBMIT
            ================================================= */}

            <div className="
              bg-white
              border
              border-slate-200
              rounded-2xl
              shadow-[0_2px_10px_rgba(15,23,42,0.035)]
              p-4
              md:p-5
              flex
              flex-col
              sm:flex-row
              sm:items-center
              sm:justify-between
              gap-4
            ">

              <div className="flex items-center gap-3">

                <div className="
                  w-9
                  h-9
                  rounded-lg
                  bg-teal-50
                  flex
                  items-center
                  justify-center
                ">

                  <Stethoscope className="
                    w-4
                    h-4
                    text-teal-600
                  " />

                </div>


                <div>

                  <p className="
                    text-xs
                    font-semibold
                    text-slate-700
                  ">
                    Ready to submit?
                  </p>

                  <p className="
                    text-[11px]
                    text-slate-400
                    mt-0.5
                  ">
                    Review the prescription details before submitting.
                  </p>

                </div>

              </div>


              <button
                type="submit"
                className="
                  w-full
                  sm:w-auto
                  min-w-[190px]
                  h-10
                  px-5
                  rounded-lg
                  bg-teal-600
                  text-white
                  text-xs
                  font-semibold
                  hover:bg-teal-700
                  active:bg-teal-800
                  transition
                  flex
                  items-center
                  justify-center
                  gap-2
                "
              >

                <CheckCircle2 className="w-4 h-4" />

                Submit Prescription

              </button>

            </div>

          </form>

        </div>

      </main>

    </div>
  );
}


/* =====================================================
   SECTION HEADER
===================================================== */

function SectionHeader({
  icon,
  title,
  subtitle,
  iconClass,
}) {
  return (
    <div className="
      px-5
      py-4
      md:px-6
      border-b
      border-slate-100
      flex
      items-center
      gap-3
    ">

      <div
        className={`
          w-9
          h-9
          shrink-0
          rounded-lg
          flex
          items-center
          justify-center
          ${iconClass}
        `}
      >

        <span className="
          [&>svg]:w-[17px]
          [&>svg]:h-[17px]
        ">
          {icon}
        </span>

      </div>


      <div>

        <h2 className="
          text-sm
          font-semibold
          text-slate-800
        ">
          {title}
        </h2>

        <p className="
          text-[11px]
          text-slate-400
          mt-0.5
        ">
          {subtitle}
        </p>

      </div>

    </div>
  );
}


/* =====================================================
   FORM FIELD
===================================================== */

function FormField({
  label,
  required = false,
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

        {required && (
          <span className="text-red-400 ml-0.5">
            *
          </span>
        )}

      </label>

      {children}

    </div>
  );
}


/* =====================================================
   FIELD LABEL
===================================================== */

function FieldLabel({
  children,
}) {
  return (
    <span className="
      text-[10px]
      uppercase
      tracking-wide
      font-semibold
      text-slate-400
    ">
      {children}
    </span>
  );
}


/* =====================================================
   FILE SIZE
===================================================== */

function formatFileSize(bytes) {
  if (!bytes) return "Unknown size";

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(
    bytes /
    (1024 * 1024)
  ).toFixed(1)} MB`;
}