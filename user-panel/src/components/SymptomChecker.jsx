import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Stethoscope, Send, RotateCcw, ChevronDown, ChevronUp,
  ShieldAlert, Info, User, Mic, MicOff, Volume2,
  AlertTriangle, Activity, Save, Loader2, CheckCircle,
} from "lucide-react";
import { getPatientProfile, updatePatientProfile, checkSymptoms } from "../services/api";

/* ── helpers ── */
const calcAge = (dob) => {
  if (!dob) return null;
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
};
const calcBMI = (h, w) => {
  if (!h || !w) return null;
  const m = parseFloat(h) / 100;
  return parseFloat((parseFloat(w) / (m * m)).toFixed(1));
};
const confidenceColor = (c) => {
  if (c >= 0.6) return { bg:"#FEF2F2", border:"#FECACA", text:"#DC2626", badge:"#EF4444" };
  if (c >= 0.3) return { bg:"#FFFBEB", border:"#FDE68A", text:"#D97706", badge:"#F59E0B" };
  return            { bg:"#F0FDF4", border:"#BBF7D0", text:"#16A34A", badge:"#22C55E" };
};
const rankLabel = (r) => r === 1 ? "Most Likely" : r === 2 ? "Possible" : "Less Likely";

/* ── AI profile completeness check ── */
const isAIProfileComplete = (p) => !!(p && p.height && p.weight);

/* ── Voice hook ── */
function useVoice({ onTranscript }) {
  const [listening,  setListening]  = useState(false);
  const [supported,  setSupported]  = useState(true);
  const [voiceError, setVoiceError] = useState(null);
  const [interim,    setInterim]    = useState("");
  const recRef = useRef(null);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setSupported(false); return; }
    const r = new SR();
    r.continuous = true; r.interimResults = true; r.maxAlternatives = 1;
    r.onresult = (e) => {
      let fin = "", int = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        e.results[i].isFinal ? (fin += t) : (int += t);
      }
      if (fin) onTranscript(fin);
      setInterim(int);
    };
    r.onerror = (e) => {
      setVoiceError(e.error === "not-allowed"
        ? "Microphone access denied."
        : e.error === "no-speech"
        ? "No speech detected."
        : `Voice error: ${e.error}`);
      setListening(false); setInterim("");
    };
    r.onend = () => { setListening(false); setInterim(""); };
    recRef.current = r;
    return () => { try { r.abort(); } catch {} };
  }, [onTranscript]);

  const start = useCallback(() => {
    if (!recRef.current) return;
    setVoiceError(null); setInterim("");
    try { recRef.current.start(); setListening(true); }
    catch { recRef.current.stop(); setTimeout(() => { try { recRef.current.start(); setListening(true); } catch {} }, 200); }
  }, []);

  const stop = useCallback(() => {
    if (!recRef.current) return;
    recRef.current.stop(); setListening(false); setInterim("");
  }, []);

  return { listening, supported, voiceError, interim, start, stop };
}

/* ── AI Health Profile Gate ── */
function AIProfileGate({ profile, onComplete }) {
  const [form, setForm]     = useState({
    height:               profile?.height || "",
    weight:               profile?.weight || "",
    isPregnant:           profile?.isPregnant || false,
    smokingStatus:        profile?.smokingStatus || "",
    alcoholUse:           profile?.alcoholUse || false,
    hasChronicDisease:    profile?.hasChronicDisease || false,
    chronicDiseaseDetail: profile?.chronicDiseaseDetail || "",
    familyHistory:        profile?.familyHistory || "",
  });
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState(null);
  const [success,  setSuccess]  = useState(false);
  const gender = profile?.gender || "";

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSave = async () => {
    if (!form.height || !form.weight) {
      setError("Height and weight are required for accurate predictions."); return;
    }
    setSaving(true); setError(null);
    try {
      const result = await updatePatientProfile({
        height:               Number(form.height),
        weight:               Number(form.weight),
        isPregnant:           form.isPregnant,
        smokingStatus:        form.smokingStatus || null,
        alcoholUse:           form.alcoholUse,
        hasChronicDisease:    form.hasChronicDisease,
        chronicDiseaseDetail: form.chronicDiseaseDetail || null,
        familyHistory:        form.familyHistory || null,
      });
      if (result?.patient) {
        setSuccess(true);
        setTimeout(() => onComplete(result.patient), 1000);
      } else {
        setError("Failed to save. Please try again.");
      }
    } catch { setError("Network error. Please try again."); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "20px 20px 40px" }}>
      {/* Header card */}
      <div style={{
        background: "white", borderRadius: 16, padding: 24,
        border: "1.5px solid #E2E8F0", marginBottom: 16,
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
          <div style={{
            width:40, height:40, borderRadius:12,
            background:"linear-gradient(135deg,#8B5CF6,#7C3AED)",
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>
            <User size={18} color="white" />
          </div>
          <div>
            <p style={{ margin:0, fontSize:15, fontWeight:700, color:"#0F172A" }}>
              Complete your health profile
            </p>
            <p style={{ margin:0, fontSize:12, color:"#94A3B8" }}>
              Required for clinically accurate AI predictions
            </p>
          </div>
        </div>

        <p style={{
          margin:"0 0 20px", fontSize:12, color:"#64748B",
          background:"#F8FAFC", borderRadius:8, padding:"10px 12px",
          lineHeight:1.6,
        }}>
          The AI uses your physical and health details to filter out impossible predictions
          (e.g. male patients won't see PCOS, post-menopausal women won't see period-related diseases).
          This runs entirely on your device — nothing is shared externally.
        </p>

        {/* Height & Weight */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16 }}>
          <div>
            <label style={{ display:"block", fontSize:12, fontWeight:600, color:"#374151", marginBottom:4 }}>
              Height (cm) <span style={{ color:"#EF4444" }}>*</span>
            </label>
            <input
              type="number" name="height" value={form.height} onChange={handleChange}
              placeholder="e.g. 165"
              style={{
                width:"100%", padding:"10px 12px", borderRadius:8, fontSize:13,
                border:`1.5px solid ${!form.height ? "#FCA5A5" : "#E2E8F0"}`,
                background: !form.height ? "#FFF8F8" : "white",
                outline:"none", boxSizing:"border-box",
              }}
            />
          </div>
          <div>
            <label style={{ display:"block", fontSize:12, fontWeight:600, color:"#374151", marginBottom:4 }}>
              Weight (kg) <span style={{ color:"#EF4444" }}>*</span>
            </label>
            <input
              type="number" name="weight" value={form.weight} onChange={handleChange}
              placeholder="e.g. 60"
              style={{
                width:"100%", padding:"10px 12px", borderRadius:8, fontSize:13,
                border:`1.5px solid ${!form.weight ? "#FCA5A5" : "#E2E8F0"}`,
                background: !form.weight ? "#FFF8F8" : "white",
                outline:"none", boxSizing:"border-box",
              }}
            />
          </div>
        </div>

        {/* Smoking */}
        <div style={{ marginBottom:12 }}>
          <label style={{ display:"block", fontSize:12, fontWeight:600, color:"#374151", marginBottom:4 }}>
            Smoking status
          </label>
          <select name="smokingStatus" value={form.smokingStatus} onChange={handleChange}
            style={{
              width:"100%", padding:"10px 12px", borderRadius:8, fontSize:13,
              border:"1.5px solid #E2E8F0", background:"white", outline:"none",
            }}>
            <option value="">Prefer not to say</option>
            <option value="never">Never smoked</option>
            <option value="former">Former smoker</option>
            <option value="current">Current smoker</option>
          </select>
        </div>

        {/* Toggles */}
        <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:12 }}>
          {(gender === "Female" || gender === "") && (
            <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer" }}>
              <input type="checkbox" name="isPregnant" checked={form.isPregnant} onChange={handleChange}
                style={{ width:16, height:16, accentColor:"#10B981" }} />
              <span style={{ fontSize:13, color:"#374151" }}>Currently pregnant</span>
            </label>
          )}
          <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer" }}>
            <input type="checkbox" name="alcoholUse" checked={form.alcoholUse} onChange={handleChange}
              style={{ width:16, height:16, accentColor:"#10B981" }} />
            <span style={{ fontSize:13, color:"#374151" }}>I consume alcohol regularly</span>
          </label>
          <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer" }}>
            <input type="checkbox" name="hasChronicDisease" checked={form.hasChronicDisease} onChange={handleChange}
              style={{ width:16, height:16, accentColor:"#10B981" }} />
            <span style={{ fontSize:13, color:"#374151" }}>I have a chronic disease</span>
          </label>
        </div>

        {form.hasChronicDisease && (
          <textarea name="chronicDiseaseDetail" value={form.chronicDiseaseDetail} onChange={handleChange}
            placeholder="Describe your condition (e.g. Type 2 Diabetes, Hypertension)"
            rows={2}
            style={{
              width:"100%", padding:"10px 12px", borderRadius:8, fontSize:13,
              border:"1.5px solid #E2E8F0", resize:"none", outline:"none",
              boxSizing:"border-box", marginBottom:12, fontFamily:"inherit",
            }}
          />
        )}

        {/* Family history */}
        <div style={{ marginBottom:16 }}>
          <label style={{ display:"block", fontSize:12, fontWeight:600, color:"#374151", marginBottom:4 }}>
            Family history of disease <span style={{ color:"#94A3B8", fontWeight:400 }}>(optional)</span>
          </label>
          <input name="familyHistory" value={form.familyHistory} onChange={handleChange}
            placeholder="e.g. Diabetes, Heart Disease"
            style={{
              width:"100%", padding:"10px 12px", borderRadius:8, fontSize:13,
              border:"1.5px solid #E2E8F0", outline:"none", boxSizing:"border-box",
            }}
          />
        </div>

        {error && (
          <p style={{ margin:"0 0 12px", fontSize:12, color:"#DC2626", fontWeight:500 }}>{error}</p>
        )}

        {success && (
          <div style={{
            display:"flex", alignItems:"center", gap:8, padding:"10px 12px",
            background:"#F0FDF4", border:"1px solid #BBF7D0", borderRadius:8, marginBottom:12,
          }}>
            <CheckCircle size={14} color="#16A34A" />
            <span style={{ fontSize:12, color:"#16A34A", fontWeight:600 }}>
              Profile saved! Loading symptom checker…
            </span>
          </div>
        )}

        <button
          onClick={handleSave} disabled={saving}
          style={{
            width:"100%", padding:"13px 20px", borderRadius:12, border:"none",
            background: saving ? "#E2E8F0" : "linear-gradient(135deg,#8B5CF6,#7C3AED)",
            color: saving ? "#94A3B8" : "white",
            fontSize:14, fontWeight:700, cursor: saving ? "not-allowed" : "pointer",
            display:"flex", alignItems:"center", justifyContent:"center", gap:8,
            boxShadow: saving ? "none" : "0 4px 16px rgba(139,92,246,0.3)",
          }}
        >
          {saving
            ? <><Loader2 size={15} style={{ animation:"spin 0.7s linear infinite" }} /> Saving…</>
            : <><Save size={15} /> Save & Continue to Symptom Checker</>}
        </button>
      </div>

      <p style={{ textAlign:"center", fontSize:11, color:"#94A3B8", margin:0 }}>
        You can update these details anytime in Settings.
      </p>
    </div>
  );
}

/* ── Sub-components ── */
function ProfileBanner({ profile }) {
  if (!profile) return null;
  const age = calcAge(profile.dob);
  const bmi = calcBMI(profile.height, profile.weight);
  const items = [
    profile.gender && { label:"Gender", value: profile.gender },
    age            && { label:"Age",    value:`${age} yrs`    },
    bmi            && { label:"BMI",    value: bmi             },
    profile.isPregnant && { label:"Pregnant", value:"Yes"     },
  ].filter(Boolean);
  if (!items.length) return null;
  return (
    <div style={{
      background:"rgba(16,185,129,0.06)", border:"1px solid rgba(16,185,129,0.2)",
      borderRadius:12, padding:"10px 14px",
      display:"flex", alignItems:"center", gap:10, flexWrap:"wrap",
    }}>
      <User size={13} color="#10B981" style={{ flexShrink:0 }} />
      <span style={{ fontSize:11, color:"#10B981", fontWeight:600 }}>Profile auto-filled:</span>
      {items.map((item, i) => (
        <span key={i} style={{
          fontSize:11, color:"#475569", background:"white",
          border:"1px solid #E2E8F0", borderRadius:6, padding:"2px 8px",
        }}>
          <span style={{ color:"#94A3B8" }}>{item.label}: </span>
          <span style={{ fontWeight:600 }}>{item.value}</span>
        </span>
      ))}
    </div>
  );
}

function RedFlagBanner({ flags }) {
  if (!flags?.length) return null;
  return (
    <div style={{
      background:"#FEF2F2", border:"1.5px solid #FECACA",
      borderRadius:12, padding:"12px 14px",
      display:"flex", gap:10, alignItems:"flex-start",
    }}>
      <ShieldAlert size={16} color="#DC2626" style={{ flexShrink:0, marginTop:1 }} />
      <div>
        <p style={{ margin:0, fontSize:12, fontWeight:700, color:"#DC2626" }}>
          ⚠️ Red flag symptoms detected — seek immediate care
        </p>
        <p style={{ margin:"4px 0 0", fontSize:11, color:"#B91C1C" }}>
          {flags.join(" · ")}
        </p>
      </div>
    </div>
  );
}

function FilterNotesBanner({ notes }) {
  const [open, setOpen] = useState(false);
  if (!notes?.length) return null;
  return (
    <div style={{
      background:"#FFFBEB", border:"1px solid #FDE68A", borderRadius:12, padding:"10px 14px",
    }}>
      <button onClick={() => setOpen(o => !o)} style={{
        display:"flex", alignItems:"center", gap:8,
        background:"none", border:"none", cursor:"pointer", width:"100%", padding:0,
      }}>
        <Info size={13} color="#D97706" />
        <span style={{ fontSize:11, fontWeight:600, color:"#D97706", flex:1, textAlign:"left" }}>
          {notes.length} result{notes.length > 1 ? "s" : ""} filtered for clinical accuracy
        </span>
        {open ? <ChevronUp size={13} color="#D97706" /> : <ChevronDown size={13} color="#D97706" />}
      </button>
      {open && (
        <ul style={{ margin:"8px 0 0", paddingLeft:20 }}>
          {notes.map((n, i) => (
            <li key={i} style={{ fontSize:11, color:"#92400E", marginBottom:3 }}>{n}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function PredictionCard({ pred }) {
  const [open, setOpen] = useState(pred.rank === 1);
  const c = confidenceColor(pred.confidence);
  return (
    <div style={{
      background:"white", border:`1.5px solid ${pred.rank === 1 ? c.border : "#E2E8F0"}`,
      borderRadius:14, overflow:"hidden",
      boxShadow: pred.rank === 1 ? `0 2px 12px ${c.border}` : "0 1px 4px rgba(0,0,0,0.04)",
    }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width:"100%", display:"flex", alignItems:"center", gap:12, padding:"14px 16px",
        background: pred.rank === 1 ? c.bg : "white",
        border:"none", cursor:"pointer", textAlign:"left",
      }}>
        <div style={{
          width:28, height:28, borderRadius:8, flexShrink:0,
          background:c.badge, display:"flex", alignItems:"center",
          justifyContent:"center", fontSize:12, fontWeight:800, color:"white",
        }}>{pred.rank}</div>
        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ margin:0, fontSize:14, fontWeight:700, color:"#0F172A", lineHeight:1.3 }}>
            {pred.disease}
          </p>
          <p style={{ margin:"2px 0 0", fontSize:11, color:"#94A3B8" }}>{rankLabel(pred.rank)}</p>
        </div>
        <div style={{ textAlign:"right", flexShrink:0 }}>
          <p style={{ margin:0, fontSize:16, fontWeight:800, color:c.text }}>{pred.confidence_pct}</p>
          <p style={{ margin:"2px 0 0", fontSize:10, color:"#94A3B8" }}>confidence</p>
        </div>
        {open ? <ChevronUp size={14} color="#94A3B8" style={{ flexShrink:0 }} />
               : <ChevronDown size={14} color="#94A3B8" style={{ flexShrink:0 }} />}
      </button>
      {open && (
        <div style={{ padding:"0 16px 16px", borderTop:"1px solid #F1F5F9" }}>
          {pred.description && (
            <p style={{ margin:"12px 0 0", fontSize:12, color:"#475569", lineHeight:1.7 }}>
              {pred.description}
            </p>
          )}
          {pred.risk_notes?.length > 0 && (
            <div style={{ marginTop:12 }}>
              {pred.risk_notes.map((note, i) => (
                <div key={i} style={{
                  display:"flex", gap:8, alignItems:"flex-start",
                  padding:"8px 10px", marginTop:6,
                  background:"#FFF7ED", border:"1px solid #FED7AA", borderRadius:8,
                }}>
                  <AlertTriangle size={12} color="#EA580C" style={{ flexShrink:0, marginTop:1 }} />
                  <p style={{ margin:0, fontSize:11, color:"#C2410C", lineHeight:1.5 }}>{note}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Main Component ── */
export function SymptomChecker({ navigateTo }) {
  const [profile,   setProfile]   = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [text,      setText]      = useState("");
  const [charCount, setCharCount] = useState(0);
  const [result,    setResult]    = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);

  useEffect(() => {
    getPatientProfile()
      .then(data => setProfile(data?.patient || null))
      .catch(() => setProfile(null))
      .finally(() => setProfileLoading(false));
  }, []);

  /* Voice */
  const handleTranscript = useCallback((t) => {
    setText(prev => {
      const spacer = prev && !prev.endsWith(" ") ? " " : "";
      const next = prev + spacer + t;
      setCharCount(next.length);
      return next;
    });
    if (error) setError(null);
  }, [error]);

  const { listening, supported, voiceError, interim, start, stop } =
    useVoice({ onTranscript: handleTranscript });

  const handleTextChange = (e) => {
    setText(e.target.value);
    setCharCount(e.target.value.length);
    if (error) setError(null);
  };

  const handleAnalyse = async () => {
    if (listening) stop();
    const trimmed = text.trim();
    if (!trimmed || trimmed.length < 10) {
      setError("Please describe your symptoms in at least a few words.");
      return;
    }
    setLoading(true); setError(null); setResult(null);
    try {
      const age = calcAge(profile?.dob);
      const bmi = calcBMI(profile?.height, profile?.weight);
      const payload = {
        symptom_text:           trimmed,
        age:                    age  || 30,
        gender:                 profile?.gender || "Unknown",
        bmi:                    bmi  || 22.0,
        has_chronic_disease:    profile?.hasChronicDisease    || false,
        chronic_disease_detail: profile?.chronicDiseaseDetail || "",
        is_pregnant:            profile?.isPregnant           || false,
        smoking_status:         profile?.smokingStatus        || "never",
        alcohol_use:            profile?.alcoholUse           || false,
        family_history:         profile?.familyHistory        || "",
        symptom_duration_days:  3,
        recent_travel:          false,
        top_n:                  3,
      };
      const data = await checkSymptoms(payload);
      if (!data || data.detail) {
        const msg = typeof data?.detail === "string"
          ? data.detail
          : Array.isArray(data?.detail)
            ? data.detail.map(d => d.msg || JSON.stringify(d)).join(", ")
            : "Could not analyse symptoms. Please try describing them differently.";
        setError(msg); return;
      }
      setResult(data);
    } catch (err) {
      console.error(err);
      setError("Service is unavailable right now. Please try again in a moment.");
    } finally { setLoading(false); }
  };

  const handleReset = () => {
    if (listening) stop();
    setText(""); setResult(null); setError(null); setCharCount(0);
  };

  const canSubmit = text.trim().length >= 10 && !loading;

  /* Loading state */
  if (profileLoading) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#F1F5F9" }}>
      <Loader2 size={32} color="#8B5CF6" style={{ animation:"spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  /* AI profile gate */
  if (!isAIProfileComplete(profile)) {
    return (
      <div style={{ minHeight:"100vh", background:"#F1F5F9" }}>
        <div style={{
          background:"white", borderBottom:"1px solid #E2E8F0",
          padding:"16px 24px 16px 64px",
        }}>
          <h1 style={{ margin:0, fontSize:17, fontWeight:700, color:"#0F172A" }}>Symptom Checker</h1>
          <p style={{ margin:"2px 0 0", fontSize:12, color:"#94A3B8" }}>
            Step 1 of 2 — Complete your health profile
          </p>
        </div>
        <AIProfileGate
          profile={profile}
          onComplete={(updated) => setProfile(updated)}
        />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  /* Main symptom checker */
  return (
    <div style={{ minHeight:"100vh", background:"#F1F5F9" }}>
      {/* Header */}
      <div style={{
        background:"white", borderBottom:"1px solid #E2E8F0",
        padding:"16px 24px", display:"flex", alignItems:"center",
        justifyContent:"space-between",
      }}>
        <div style={{ paddingLeft:40 }}>
          <h1 style={{ margin:0, fontSize:17, fontWeight:700, color:"#0F172A" }}>Symptom Checker</h1>
          <p style={{ margin:"2px 0 0", fontSize:12, color:"#94A3B8" }}>
            AI-powered analysis · type or speak in any language
          </p>
        </div>
        {result && (
          <button onClick={handleReset} style={{
            display:"flex", alignItems:"center", gap:6,
            padding:"8px 14px", borderRadius:9,
            border:"1.5px solid #E2E8F0", background:"white",
            fontSize:12, fontWeight:600, color:"#64748B", cursor:"pointer",
          }}>
            <RotateCcw size={13} /> New Check
          </button>
        )}
      </div>

      <div style={{ maxWidth:860, margin:"0 auto", padding:"20px 20px 40px" }}>

        {/* Input panel */}
        {!result && (
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <ProfileBanner profile={profile} />

            {/* Textarea card */}
            <div style={{
              background:"white", borderRadius:16, padding:20,
              border:`1.5px solid ${listening ? "rgba(239,68,68,0.4)" : "#E2E8F0"}`,
              boxShadow:"0 1px 4px rgba(0,0,0,0.04)", transition:"border-color 0.2s",
            }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                <div style={{
                  width:32, height:32, borderRadius:9,
                  background:"linear-gradient(135deg,#8B5CF6,#7C3AED)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                }}>
                  <Stethoscope size={15} color="white" />
                </div>
                <div>
                  <p style={{ margin:0, fontSize:13, fontWeight:700, color:"#0F172A" }}>
                    Describe your symptoms
                  </p>
                  <p style={{ margin:0, fontSize:11, color:"#94A3B8" }}>
                    Type or use the mic · any language supported
                  </p>
                </div>
              </div>

              <textarea
                value={text} onChange={handleTextChange}
                placeholder={`Examples:\n• "I have fever and burning sensation while urinating"\n• "मुझे बुखार है और पेशाब में जलन हो रही है"\n• "Irregular periods, acne, weight gain since 3 months"`}
                rows={6}
                style={{
                  width:"100%", padding:"12px 14px",
                  border:`1.5px solid ${error ? "#FECACA" : listening ? "rgba(239,68,68,0.3)" : "#E2E8F0"}`,
                  borderRadius:10, fontSize:13, color:"#0F172A",
                  background: error ? "#FFF8F8" : "#F8FAFC",
                  resize:"none", outline:"none", fontFamily:"inherit",
                  lineHeight:1.6, boxSizing:"border-box", transition:"border-color 0.15s",
                }}
                onFocus={e => { e.target.style.borderColor="#8B5CF6"; e.target.style.background="white"; }}
                onBlur={e  => { e.target.style.borderColor=error?"#FECACA":"#E2E8F0"; e.target.style.background=error?"#FFF8F8":"#F8FAFC"; }}
              />

              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:6 }}>
                <span style={{ fontSize:11, color: charCount < 10 ? "#F59E0B" : "#94A3B8" }}>
                  {charCount < 10 ? `${10 - charCount} more characters needed` : `${charCount} characters`}
                </span>
                {error && <span style={{ fontSize:11, color:"#DC2626", fontWeight:500 }}>{error}</span>}
              </div>
            </div>

            {/* Voice live indicator */}
            {listening && (
              <div style={{
                padding:"8px 14px", background:"rgba(239,68,68,0.05)",
                border:"1px solid rgba(239,68,68,0.2)", borderRadius:10,
                display:"flex", alignItems:"center", gap:8,
              }}>
                <span style={{
                  width:8, height:8, borderRadius:"50%", background:"#EF4444",
                  animation:"blink 1s ease-in-out infinite", flexShrink:0,
                }} />
                <span style={{ fontSize:12, color:"#DC2626" }}>
                  {interim ? interim : "Listening… speak your symptoms"}
                </span>
              </div>
            )}

            {voiceError && (
              <p style={{ margin:0, fontSize:11, color:"#DC2626" }}>{voiceError}</p>
            )}

            {/* Button row */}
            <div style={{ display:"flex", gap:10 }}>
              {supported && (
                <button
                  onClick={listening ? stop : start}
                  style={{
                    flexShrink:0, padding:"15px 18px", borderRadius:12,
                    border: listening ? "2px solid #EF4444" : "2px solid #E2E8F0",
                    background: listening ? "linear-gradient(135deg,#FEF2F2,#FEE2E2)" : "white",
                    color: listening ? "#DC2626" : "#64748B",
                    fontSize:13, fontWeight:700, cursor:"pointer",
                    display:"flex", alignItems:"center", gap:7,
                    animation: listening ? "micPulse 1.4s ease-in-out infinite" : "none",
                    transition:"all 0.2s", whiteSpace:"nowrap",
                  }}
                >
                  {listening ? <><MicOff size={14} /> Stop</> : <><Mic size={14} /> Speak</>}
                </button>
              )}

              <button
                onClick={handleAnalyse} disabled={!canSubmit}
                style={{
                  flex:1, padding:"15px 20px", borderRadius:12, border:"none",
                  background: canSubmit ? "linear-gradient(135deg,#8B5CF6,#7C3AED)" : "#E2E8F0",
                  color: canSubmit ? "white" : "#94A3B8",
                  fontSize:14, fontWeight:700, cursor: canSubmit ? "pointer" : "not-allowed",
                  display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                  boxShadow: canSubmit ? "0 4px 16px rgba(139,92,246,0.3)" : "none",
                  transition:"all 0.2s",
                }}
              >
                {loading ? (
                  <><span style={{
                    width:16, height:16, border:"2.5px solid rgba(255,255,255,0.4)",
                    borderTopColor:"white", borderRadius:"50%",
                    animation:"spin 0.7s linear infinite", display:"inline-block",
                  }} /> Analysing…</>
                ) : (
                  <><Send size={15} /> Analyse Symptoms</>
                )}
              </button>
            </div>

            <p style={{ textAlign:"center", fontSize:11, color:"#94A3B8", margin:0, lineHeight:1.6 }}>
              This tool provides informational insights only — not a medical diagnosis.
              Always consult a qualified healthcare professional.
            </p>
          </div>
        )}

        {/* Results panel */}
        {result && (
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div style={{
              background:"white", borderRadius:14,
              border:"1px solid #E2E8F0", padding:"14px 16px",
              boxShadow:"0 1px 4px rgba(0,0,0,0.04)",
            }}>
              <p style={{ margin:"0 0 8px", fontSize:11, fontWeight:700, color:"#94A3B8", textTransform:"uppercase", letterSpacing:"0.8px" }}>
                Symptoms identified
              </p>
              <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                {result.symptoms_matched?.map((s, i) => (
                  <span key={i} style={{
                    padding:"4px 10px", borderRadius:20,
                    background:"rgba(139,92,246,0.08)",
                    border:"1px solid rgba(139,92,246,0.2)",
                    fontSize:11, color:"#7C3AED", fontWeight:500,
                  }}>{s}</span>
                ))}
              </div>
            </div>

            <RedFlagBanner flags={result.red_flags} />
            <FilterNotesBanner notes={result.filter_notes} />

            {result.predictions?.length > 0 ? (
              <>
                <p style={{ margin:"4px 0 0", fontSize:11, fontWeight:700, color:"#94A3B8", textTransform:"uppercase", letterSpacing:"0.8px" }}>
                  Analysis results
                </p>
                {result.predictions.map(pred => <PredictionCard key={pred.rank} pred={pred} />)}
              </>
            ) : (
              <div style={{
                background:"white", borderRadius:14, padding:32,
                textAlign:"center", border:"1px solid #E2E8F0",
              }}>
                <Activity size={32} color="#E2E8F0" style={{ marginBottom:12 }} />
                <p style={{ margin:0, fontSize:14, fontWeight:600, color:"#64748B" }}>
                  No matching conditions found
                </p>
                <p style={{ margin:"6px 0 0", fontSize:12, color:"#94A3B8" }}>
                  Try describing your symptoms in more detail.
                </p>
              </div>
            )}

            <button
              onClick={() => navigateTo("appointments")}
              style={{
                width:"100%", padding:"14px 20px", borderRadius:12, border:"none",
                background:"linear-gradient(135deg,#10B981,#059669)",
                color:"white", fontSize:14, fontWeight:700,
                cursor:"pointer", display:"flex", alignItems:"center",
                justifyContent:"center", gap:8,
                boxShadow:"0 4px 16px rgba(16,185,129,0.3)", marginTop:4,
              }}
            >
              <User size={15} /> Book a Doctor Consultation
            </button>

            <p style={{ textAlign:"center", fontSize:11, color:"#94A3B8", margin:0, lineHeight:1.6 }}>
              {result.disclaimer}
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin     { to { transform: rotate(360deg); } }
        @keyframes micPulse { 0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,0.3);}50%{box-shadow:0 0 0 8px rgba(239,68,68,0);} }
        @keyframes blink    { 0%,100%{opacity:1;}50%{opacity:0.3;} }
      `}</style>
    </div>
  );
}