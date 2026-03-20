import React, { useState, useEffect } from "react";
import {
  Bell, Calendar, Filter, Star, Video, Clock, User,
  Loader2, AlertCircle, CheckCircle, ChevronDown,
} from "lucide-react";
import { getVerifiedDoctors, bookAppointment } from "../services/api";

const BASE = "http://localhost:5000";

export function AppointmentBooking({ navigateTo }) {
  const [doctors,      setDoctors]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [filter,       setFilter]       = useState("All");
  const [specs,        setSpecs]        = useState(["All"]);
  const [modal,        setModal]        = useState(false);
  const [selected,     setSelected]     = useState(null);
  const [day,          setDay]          = useState("");
  const [slot,         setSlot]         = useState("");
  const [booking,      setBooking]      = useState(false);
  const [success,      setSuccess]      = useState(false);

  useEffect(() => {
    getVerifiedDoctors().then((data) => {
      setDoctors(data);
      setSpecs(["All", ...new Set(data.map(d => d.specialization).filter(Boolean))]);
      setLoading(false);
    });
  }, []);

  const list = filter === "All" ? doctors : doctors.filter(d => d.specialization === filter);

  const open = (doc) => {
    setSelected(doc); setDay(""); setSlot(""); setSuccess(false); setModal(true);
  };

  const confirm = async () => {
    if (!slot || (!day && selected?.availability?.length)) {
      alert("Please select a day and time slot."); return;
    }
    setBooking(true);
    const r = await bookAppointment({ doctorId: selected._id, date: day || "TBD", timeSlot: slot, consultationType: "video" });
    setBooking(false);
    if (r?.appointment) { setSuccess(true); setTimeout(() => { setModal(false); navigateTo("dashboard"); }, 1800); }
    else alert(r?.message || "Booking failed. Please try again.");
  };

  const slots = () => {
    if (!selected?.availability?.length) return [];
    const entry = day ? selected.availability.find(a => a.day === day) : selected.availability[0];
    return entry?.slots ?? [];
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4">
          <div className="pl-10 lg:pl-0">
            <h1 className="text-gray-800 font-bold text-lg">Book Appointment</h1>
            <p className="text-gray-400 text-xs hidden sm:block">Choose a verified doctor for consultation</p>
          </div>
          <button className="relative p-2 hover:bg-gray-100 rounded-xl">
            <Bell className="w-5 h-5 text-gray-500" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
          </button>
        </div>
      </header>

      {/* Filter */}
      <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <Filter className="w-4 h-4" /> Specialization:
          </div>
          <div className="relative">
            <select
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="appearance-none bg-gray-100 text-gray-700 text-sm px-4 pr-8 py-2
                rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer"
            >
              {specs.map(s => <option key={s}>{s}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>
          {!loading && (
            <span className="ml-auto text-gray-400 text-xs">{list.length} doctor{list.length !== 1 ? "s" : ""}</span>
          )}
        </div>
      </div>

      {/* Content */}
      <main className="px-4 sm:px-6 py-6 max-w-6xl mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
            <p className="text-gray-400 text-sm">Loading verified doctors…</p>
          </div>
        ) : list.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
              <User className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-600 font-medium">No doctors available</p>
            <p className="text-gray-400 text-sm mt-1">Try a different specialization filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
            {list.map(doc => (
              <div key={doc._id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100
                  hover:shadow-md hover:border-emerald-200 transition-all duration-200">
                {/* Doctor header */}
                <div className="p-5 pb-4">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500
                      flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
                      {doc.profilePhoto
                        ? <img src={`${BASE}/${doc.profilePhoto}`} alt={doc.name} className="w-full h-full object-cover" />
                        : <User className="w-7 h-7 text-white" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-gray-800 font-semibold text-sm">Dr. {doc.name}</h3>
                      <p className="text-emerald-600 text-xs font-medium mt-0.5">{doc.specialization}</p>
                      <div className="flex items-center gap-1 mt-1.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
                        ))}
                        <span className="text-gray-400 text-xs ml-1">4.8</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-gray-500">
                    {doc.experience && (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-blue-50 rounded-md flex items-center justify-center">
                          <User className="w-3 h-3 text-blue-500" />
                        </div>
                        <span>{doc.experience} years experience</span>
                      </div>
                    )}
                    {doc.qualification && (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-purple-50 rounded-md flex items-center justify-center">
                          <Calendar className="w-3 h-3 text-purple-500" />
                        </div>
                        <span className="truncate">{doc.qualification}</span>
                      </div>
                    )}
                    {doc.availability?.length > 0 && (
                      <div className="flex items-start gap-2">
                        <div className="w-5 h-5 bg-green-50 rounded-md flex items-center justify-center flex-shrink-0">
                          <Clock className="w-3 h-3 text-green-500" />
                        </div>
                        <span className="text-green-600 font-medium">
                          {doc.availability.map(a => a.day).slice(0, 3).join(", ")}
                          {doc.availability.length > 3 && " +more"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-5 pb-5">
                  <button
                    onClick={() => open(doc)}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white
                      py-2.5 rounded-xl text-sm font-semibold hover:from-emerald-600 hover:to-teal-600
                      transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Video className="w-4 h-4" /> Book Appointment
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Booking Modal */}
      {modal && selected && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center
          justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md
            shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">

            {success ? (
              <div className="text-center py-14 px-8">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center
                  justify-center mx-auto mb-5">
                  <CheckCircle className="w-10 h-10 text-emerald-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Appointment Booked!</h3>
                <p className="text-gray-400 text-sm">Redirecting to your dashboard…</p>
              </div>
            ) : (
              <>
                {/* Modal header */}
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-6 text-white">
                  <h2 className="font-bold text-lg mb-1">Confirm Appointment</h2>
                  <p className="text-emerald-100 text-sm">Video Consultation</p>
                </div>

                <div className="p-6 space-y-5">
                  {/* Doctor info */}
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500
                      rounded-xl flex items-center justify-center flex-shrink-0">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">Dr. {selected.name}</p>
                      <p className="text-emerald-600 text-xs">{selected.specialization}</p>
                    </div>
                  </div>

                  {/* Day picker */}
                  {selected.availability?.length > 0 && (
                    <div>
                      <p className="text-gray-700 text-sm font-semibold mb-2">Select Day</p>
                      <div className="flex flex-wrap gap-2">
                        {selected.availability.map(a => (
                          <button key={a.day} onClick={() => { setDay(a.day); setSlot(""); }}
                            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all
                              ${day === a.day
                                ? "bg-emerald-500 text-white border-emerald-500 shadow-sm"
                                : "border-gray-200 text-gray-600 hover:border-emerald-300"}`}>
                            {a.day}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Time slot picker */}
                  {(day || !selected.availability?.length) && slots().length > 0 && (
                    <div>
                      <p className="text-gray-700 text-sm font-semibold mb-2">Select Time</p>
                      <div className="flex flex-wrap gap-2">
                        {slots().map((s, i) => {
                          const label = `${s.startTime} – ${s.endTime}`;
                          return (
                            <button key={i} onClick={() => setSlot(label)}
                              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all
                                flex items-center gap-1.5
                                ${slot === label
                                  ? "bg-emerald-500 text-white border-emerald-500 shadow-sm"
                                  : "border-gray-200 text-gray-600 hover:border-emerald-300"}`}>
                              <Clock className="w-3 h-3" />{label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {!selected.availability?.length && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-xs">
                      ⚠️ No schedule set yet. The doctor will confirm timing.
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-3 pt-1">
                    <button onClick={() => setModal(false)}
                      className="flex-1 py-3 border-2 border-gray-200 text-gray-600 rounded-xl
                        text-sm font-semibold hover:bg-gray-50 transition-colors">
                      Cancel
                    </button>
                    <button onClick={confirm} disabled={booking}
                      className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white
                        rounded-xl text-sm font-semibold hover:from-emerald-600 hover:to-teal-600
                        transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                      {booking ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Booking"}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}