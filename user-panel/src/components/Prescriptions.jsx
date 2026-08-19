// user-panel/src/components/Prescriptions.jsx
// Shows the patient's prescriptions (decrypted by backend, displayed here)

import { useEffect, useState } from "react";
import { FileText, Pill, Calendar, RefreshCw, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export function Prescriptions({ navigateTo }) {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState("");
  const [expanded,      setExpanded]      = useState({});   // { id: bool }

  const fetchPrescriptions = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BACKEND_URL}/api/prescriptions/my`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setPrescriptions(data.prescriptions || []);
      } else {
        setError(data.message || "Failed to load prescriptions");
      }
    } catch {
      setError("Network error — check if backend is running");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPrescriptions(); }, []);

  const toggleExpand = (id) =>
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const fmt = (iso) => {
    if (!iso) return "—";
    try { return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }); }
    catch { return iso; }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">My Prescriptions</h1>
            <p className="text-sm text-gray-500 mt-0.5">Issued by your doctors during consultations</p>
          </div>
          <button onClick={fetchPrescriptions} disabled={loading}
            className="flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 font-medium disabled:opacity-50">
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin" style={{ borderWidth: 3 }} />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-4 text-red-600 text-sm">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-medium">Could not load prescriptions</p>
              <p className="text-red-500 text-xs mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && prescriptions.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText size={28} className="text-gray-400" />
            </div>
            <p className="text-gray-600 font-medium">No prescriptions yet</p>
            <p className="text-gray-400 text-sm mt-1">Prescriptions from your video consultations will appear here.</p>
          </div>
        )}

        {/* Prescription cards */}
        {!loading && prescriptions.map(item => {
          const rx   = item.prescription || {};
          const open = expanded[item._id];

          return (
            <div key={item._id}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-4 overflow-hidden">

              {/* Card header */}
              <button className="w-full flex items-start justify-between p-5 text-left hover:bg-gray-50 transition-colors"
                onClick={() => toggleExpand(item._id)}>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FileText size={18} className="text-teal-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">
                      Dr. {item.doctorName}
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {fmt(item.updatedAt || item.createdAt)}
                    </p>
                    {rx.diagnosis && (
                      <p className="text-sm text-teal-600 font-medium mt-1 truncate max-w-sm">
                        {rx.diagnosis}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 mt-1">
                  <span className="text-xs text-gray-400 font-mono bg-gray-100 px-2 py-0.5 rounded">
                    {item.meetingId}
                  </span>
                  {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </div>
              </button>

              {/* Expanded content */}
              {open && (
                <div className="px-5 pb-5 space-y-4 border-t border-gray-100 pt-4">

                  {/* Diagnosis */}
                  {rx.diagnosis && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Diagnosis</p>
                      <p className="text-gray-700 text-sm bg-gray-50 rounded-xl px-4 py-3">{rx.diagnosis}</p>
                    </div>
                  )}

                  {/* Medications */}
                  {rx.medications?.length > 0 && rx.medications.some(m => m.name) && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Medications</p>
                      <div className="space-y-2">
                        {rx.medications.filter(m => m.name).map((med, i) => (
                          <div key={i} className="flex items-start gap-3 bg-blue-50 rounded-xl px-4 py-3 border border-blue-100">
                            <Pill size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-800">{med.name}</p>
                              <div className="flex flex-wrap gap-3 mt-1">
                                {med.dosage    && <span className="text-xs text-gray-500">💊 {med.dosage}</span>}
                                {med.frequency && <span className="text-xs text-gray-500">🕐 {med.frequency}</span>}
                                {med.duration  && <span className="text-xs text-gray-500">📅 {med.duration}</span>}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Instructions */}
                  {rx.instructions && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Instructions</p>
                      <p className="text-gray-700 text-sm bg-gray-50 rounded-xl px-4 py-3 whitespace-pre-wrap">{rx.instructions}</p>
                    </div>
                  )}

                  {/* Follow-up */}
                  {rx.followUpDate && (
                    <div className="flex items-center gap-3 bg-orange-50 rounded-xl px-4 py-3 border border-orange-100">
                      <Calendar size={16} className="text-orange-500 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-orange-600 font-medium">Follow-up Appointment</p>
                        <p className="text-sm font-semibold text-gray-800">{fmt(rx.followUpDate)}</p>
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {rx.notes && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Additional Notes</p>
                      <p className="text-gray-700 text-sm bg-gray-50 rounded-xl px-4 py-3 whitespace-pre-wrap">{rx.notes}</p>
                    </div>
                  )}

                  {/* Encryption notice */}
                  <div className="flex items-center gap-2 text-xs text-gray-400 pt-1">
                    <span>🔒</span>
                    <span>This prescription is stored encrypted (AES-256-GCM) and decrypted only for your view.</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}