import React, { useState, useEffect, useRef } from "react";
import {
  Globe, User, Bell, Shield, Lock,
  LogOut, Save, Camera, Loader2, CheckCircle,
  AlertTriangle, X, AlertCircle,
} from "lucide-react";
import { getPatientProfile, updatePatientProfile } from "../services/api";
import TranslatedText from "./TranslatedText";
import { useLanguage, useTranslatedText } from "../context/LanguageContext";

export function Settings({
  navigateTo, patientName, onLogout,
  onProfileUpdated,
  showIncompleteToast, onDismissToast,
}) {
  const { translateToEnglish } = useLanguage();

  const [form, setForm] = useState({
    name:                 "",
    phone:                "",
    dob:                  "",
    gender:               "",
    bloodGroup:           "",
    height:               "",
    weight:               "",
    hasChronicDisease:    false,
    chronicDiseaseDetail: "",
    // New ML fields
    isPregnant:           false,
    smokingStatus:        "",
    alcoholUse:           false,
    familyHistory:        "",
    emergencyContactName:  "",
    emergencyContactPhone: "",
  });

  const [language,    setLanguage]    = useState("english");
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs,  setPushNotifs]  = useState(true);
  const [smsNotifs,   setSmsNotifs]   = useState(false);
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error,       setError]       = useState(null);
  const [missingFields, setMissingFields] = useState([]);

  const REQUIRED = [
    { key:"phone",      label:"Phone Number" },
    { key:"dob",        label:"Date of Birth" },
    { key:"gender",     label:"Gender" },
    { key:"bloodGroup", label:"Blood Group" },
    { key:"height",     label:"Height" },
    { key:"weight",     label:"Weight" },
  ];

  const getMissing = (f) =>
    REQUIRED.filter(({ key }) => {
      const v = f[key]; return v === null || v === undefined || v === "";
    }).map(({ label }) => label);

  /* ── Load profile ── */
  useEffect(() => {
    const load = async () => {
      const data = await getPatientProfile();
      if (data?.patient) {
        const p = data.patient;
        const loaded = {
          name:                 p.name  || "",
          phone:                p.phone || "",
          dob:                  p.dob ? p.dob.split("T")[0] : "",
          gender:               p.gender || "",
          bloodGroup:           p.bloodGroup || "",
          height:               p.height ?? "",
          weight:               p.weight ?? "",
          hasChronicDisease:    p.hasChronicDisease ?? false,
          chronicDiseaseDetail: p.chronicDiseaseDetail || "",
          // New ML fields
          isPregnant:           p.isPregnant ?? false,
          smokingStatus:        p.smokingStatus || "",
          alcoholUse:           p.alcoholUse ?? false,
          familyHistory:        p.familyHistory || "",
          emergencyContactName:  p.emergencyContact?.name  || "",
          emergencyContactPhone: p.emergencyContact?.phone || "",
        };
        setForm(loaded);
        setMissingFields(getMissing(loaded));
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const updated = { ...form, [name]: type === "checkbox" ? checked : value };
    setForm(updated);
    setMissingFields(getMissing(updated));
  };

  const handleSave = async () => {
    setSaving(true); setError(null); setSaveSuccess(false);
    try {
      // Free-text fields the patient may have typed in their preferred
      // language — translate to English so the database stays consistent.
      const [
        nameEn,
        chronicDetailEn,
        familyHistoryEn,
        emergencyNameEn,
      ] = await Promise.all([
        translateToEnglish(form.name),
        form.chronicDiseaseDetail ? translateToEnglish(form.chronicDiseaseDetail) : Promise.resolve(form.chronicDiseaseDetail),
        form.familyHistory ? translateToEnglish(form.familyHistory) : Promise.resolve(form.familyHistory),
        form.emergencyContactName ? translateToEnglish(form.emergencyContactName) : Promise.resolve(form.emergencyContactName),
      ]);

      const result = await updatePatientProfile({
        name:                 nameEn,
        phone:                form.phone,
        dob:                  form.dob || null,
        gender:               form.gender || null,
        bloodGroup:           form.bloodGroup || null,
        height:               form.height ? Number(form.height) : null,
        weight:               form.weight ? Number(form.weight) : null,
        hasChronicDisease:    form.hasChronicDisease,
        chronicDiseaseDetail: chronicDetailEn || null,
        // New ML fields
        isPregnant:           form.isPregnant,
        smokingStatus:        form.smokingStatus || null,
        alcoholUse:           form.alcoholUse,
        familyHistory:        familyHistoryEn || null,
        emergencyContact: {
          name:  emergencyNameEn || null,
          phone: form.emergencyContactPhone || null,
        },
      });

      if (result?.patient) {
        setSaveSuccess(true);
        setMissingFields(getMissing(form));
        // Notify parent so it can update profileComplete state
        if (onProfileUpdated) onProfileUpdated(result.patient);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setError(result?.message || "Failed to save. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) onLogout();
  };

  const phPhone            = useTranslatedText("e.g. +91 98765 43210");
  const phHeight            = useTranslatedText("e.g. 170");
  const phWeight            = useTranslatedText("e.g. 65");
  const phChronicDetail     = useTranslatedText("Please describe your chronic condition...");
  const phFamilyHistory     = useTranslatedText("e.g. Diabetes, Heart Disease, Cancer");
  const phEmergencyName     = useTranslatedText("e.g. Jane Doe");
  const phEmergencyPhone    = useTranslatedText("+91 98765 43210");

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  const profileIsComplete = missingFields.length === 0;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">

      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
        <div>
          <h1 className="text-gray-800 text-xl font-semibold"><TranslatedText>Settings</TranslatedText></h1>
          <p className="text-gray-500 text-sm"><TranslatedText>Manage your account and preferences</TranslatedText></p>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
        <div className="max-w-3xl mx-auto space-y-6">

          {/* ── "Complete your profile" toast (redirected from locked screen) ── */}
          {showIncompleteToast && (
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-amber-800 font-semibold text-sm"><TranslatedText>Complete your profile first</TranslatedText></p>
                <p className="text-amber-700 text-xs mt-0.5">
                  <TranslatedText>
                    You need to fill in all required fields before booking appointments or using other features.
                  </TranslatedText>
                </p>
              </div>
              <button onClick={onDismissToast} className="text-amber-400 hover:text-amber-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ── Profile completion status banner ── */}
          {!profileIsComplete && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                <p className="text-orange-800 font-semibold text-sm"><TranslatedText>Profile Incomplete</TranslatedText></p>
              </div>
              <p className="text-orange-700 text-xs mb-2">
                <TranslatedText>Please fill in the following required fields to unlock all features:</TranslatedText>
              </p>
              <div className="flex flex-wrap gap-1.5">
                {missingFields.map(f => (
                  <span key={f} className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                    <TranslatedText>{f}</TranslatedText>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ── Success / Error banners ── */}
          {saveSuccess && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg p-3 text-green-700">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm">
                <TranslatedText>Profile saved successfully!</TranslatedText>
                {profileIsComplete ? <TranslatedText> All features are now unlocked. ✅</TranslatedText> : ""}
              </span>
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
              <TranslatedText>{error}</TranslatedText>
            </div>
          )}

          {/* ── Profile Section ── */}
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-6">
              <User className="w-5 h-5 text-blue-600" />
              <h2 className="text-gray-800 font-semibold"><TranslatedText>Profile Information</TranslatedText></h2>
              {!profileIsComplete && (
                <span className="ml-auto text-xs px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full font-medium">
                  <TranslatedText>Required</TranslatedText>
                </span>
              )}
            </div>

            {/* Avatar */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-600" />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                <Camera className="w-4 h-4" />
                <span><TranslatedText>Change Photo</TranslatedText></span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1"><TranslatedText>Full Name</TranslatedText></label>
                <input name="name" value={form.name} onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm" />
              </div>

              {/* Phone — required */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  <TranslatedText>Phone Number</TranslatedText> <span className="text-red-400">*</span>
                </label>
                <input name="phone" value={form.phone} onChange={handleChange}
                  placeholder={phPhone}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm ${
                    !form.phone ? "border-orange-300 bg-orange-50" : "border-gray-300"
                  }`} />
              </div>

              {/* Date of Birth — required */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  <TranslatedText>Date of Birth</TranslatedText> <span className="text-red-400">*</span>
                </label>
                <input type="date" name="dob" value={form.dob} onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm ${
                    !form.dob ? "border-orange-300 bg-orange-50" : "border-gray-300"
                  }`} />
              </div>

              {/* Gender — required */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  <TranslatedText>Gender</TranslatedText> <span className="text-red-400">*</span>
                </label>
                <select name="gender" value={form.gender} onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm ${
                    !form.gender ? "border-orange-300 bg-orange-50" : "border-gray-300"
                  }`}>
                  <option value=""><TranslatedText>Select</TranslatedText></option>
                  <option value="Male"><TranslatedText>Male</TranslatedText></option>
                  <option value="Female"><TranslatedText>Female</TranslatedText></option>
                  <option value="Other"><TranslatedText>Other</TranslatedText></option>
                  <option value="Prefer not to say"><TranslatedText>Prefer not to say</TranslatedText></option>
                </select>
              </div>

              {/* Blood Group — required */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  <TranslatedText>Blood Group</TranslatedText> <span className="text-red-400">*</span>
                </label>
                <select name="bloodGroup" value={form.bloodGroup} onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm ${
                    !form.bloodGroup ? "border-orange-300 bg-orange-50" : "border-gray-300"
                  }`}>
                  <option value=""><TranslatedText>Select</TranslatedText></option>
                  {["A+","A−","B+","B−","AB+","AB−","O+","O−"].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              {/* Height — required */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  <TranslatedText>Height (cm)</TranslatedText> <span className="text-red-400">*</span>
                </label>
                <input type="number" name="height" value={form.height} onChange={handleChange}
                  placeholder={phHeight}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm ${
                    !form.height ? "border-orange-300 bg-orange-50" : "border-gray-300"
                  }`} />
              </div>

              {/* Weight — required */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  <TranslatedText>Weight (kg)</TranslatedText> <span className="text-red-400">*</span>
                </label>
                <input type="number" name="weight" value={form.weight} onChange={handleChange}
                  placeholder={phWeight}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm ${
                    !form.weight ? "border-orange-300 bg-orange-50" : "border-gray-300"
                  }`} />
              </div>
            </div>

            {/* Chronic disease toggle */}
            <div className="mt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="hasChronicDisease"
                  checked={form.hasChronicDisease} onChange={handleChange}
                  className="w-4 h-4 accent-emerald-500" />
                <span className="text-gray-700 text-sm"><TranslatedText>I have a chronic disease</TranslatedText></span>
              </label>
              {form.hasChronicDisease && (
                <textarea name="chronicDiseaseDetail" value={form.chronicDiseaseDetail}
                  onChange={handleChange}
                  placeholder={phChronicDetail}
                  rows={2}
                  className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm resize-none" />
              )}
            </div>

            {/* ── ML Health Factors ── */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <p className="text-gray-500 text-xs font-medium uppercase tracking-wide mb-3">
                <TranslatedText>Health Factors (improves AI predictions)</TranslatedText>
              </p>

              {/* Pregnancy — only for female */}
              {(form.gender === "Female" || form.gender === "") && (
                <div className="mb-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="isPregnant"
                      checked={form.isPregnant} onChange={handleChange}
                      className="w-4 h-4 accent-emerald-500" />
                    <span className="text-gray-700 text-sm">
                      <TranslatedText>Currently pregnant</TranslatedText>
                      {form.gender === "" && (
                        <span className="text-gray-400 text-xs ml-1">(<TranslatedText>shown for Female</TranslatedText>)</span>
                      )}
                    </span>
                  </label>
                </div>
              )}

              {/* Smoking status */}
              <div className="mb-3">
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  <TranslatedText>Smoking status</TranslatedText>
                </label>
                <select name="smokingStatus" value={form.smokingStatus} onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm">
                  <option value=""><TranslatedText>Prefer not to say</TranslatedText></option>
                  <option value="never"><TranslatedText>Never smoked</TranslatedText></option>
                  <option value="former"><TranslatedText>Former smoker</TranslatedText></option>
                  <option value="current"><TranslatedText>Current smoker</TranslatedText></option>
                </select>
              </div>

              {/* Alcohol use */}
              <div className="mb-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="alcoholUse"
                    checked={form.alcoholUse} onChange={handleChange}
                    className="w-4 h-4 accent-emerald-500" />
                  <span className="text-gray-700 text-sm"><TranslatedText>I consume alcohol regularly</TranslatedText></span>
                </label>
              </div>

              {/* Family history */}
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  <TranslatedText>Family history of disease</TranslatedText>
                </label>
                <input name="familyHistory" value={form.familyHistory} onChange={handleChange}
                  placeholder={phFamilyHistory}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm" />
                <p className="text-gray-400 text-xs mt-1">
                  <TranslatedText>Separate conditions with commas</TranslatedText>
                </p>
              </div>
            </div>
          </div>

          {/* ── Emergency Contact ── */}
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-red-500" />
              <h2 className="text-gray-800 font-semibold"><TranslatedText>Emergency Contact</TranslatedText></h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1"><TranslatedText>Contact Name</TranslatedText></label>
                <input name="emergencyContactName" value={form.emergencyContactName}
                  onChange={handleChange} placeholder={phEmergencyName}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm" />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1"><TranslatedText>Contact Phone</TranslatedText></label>
                <input name="emergencyContactPhone" value={form.emergencyContactPhone}
                  onChange={handleChange} placeholder={phEmergencyPhone}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm" />
              </div>
            </div>
          </div>

          {/* ── Language ── */}
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="w-5 h-5 text-green-600" />
              <h2 className="text-gray-800 font-semibold"><TranslatedText>Language</TranslatedText></h2>
            </div>
            <select value={language} onChange={e => setLanguage(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm">
              <option value="english">English</option>
              <option value="hindi">Hindi (हिंदी)</option>
              <option value="marathi">Marathi (मराठी)</option>
              <option value="punjabi">Punjabi (ਪੰਜਾਬੀ)</option>
              <option value="spanish">Spanish</option>
              <option value="french">French</option>
            </select>
            <p className="text-gray-400 text-xs mt-2">
              <TranslatedText>
                To translate the whole app interface, use the Languages menu in the sidebar. This field is for your saved communication preference only.
              </TranslatedText>
            </p>
          </div>

          {/* ── Notifications ── */}
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5 text-purple-600" />
              <h2 className="text-gray-800 font-semibold"><TranslatedText>Notifications</TranslatedText></h2>
            </div>
            <div className="space-y-3">
              {[
                { label:"Email Notifications", desc:"Appointment reminders via email", val:emailNotifs, set:setEmailNotifs },
                { label:"Push Notifications",  desc:"Browser push notifications",      val:pushNotifs,  set:setPushNotifs  },
                { label:"SMS Notifications",   desc:"SMS for urgent updates",           val:smsNotifs,   set:setSmsNotifs   },
              ].map(({ label, desc, val, set }) => (
                <div key={label} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-gray-800 text-sm"><TranslatedText>{label}</TranslatedText></p>
                    <p className="text-gray-500 text-xs"><TranslatedText>{desc}</TranslatedText></p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={val}
                      onChange={e => set(e.target.checked)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-emerald-500
                      after:content-[''] after:absolute after:top-[2px] after:left-[2px]
                      after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all
                      peer-checked:after:translate-x-full" />
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* ── Security ── */}
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-orange-500" />
              <h2 className="text-gray-800 font-semibold"><TranslatedText>Security</TranslatedText></h2>
            </div>
            <div className="space-y-2">
              {[
                { icon:Lock,   label:"Change Password" },
                { icon:Shield, label:"Two-Factor Authentication" },
              ].map(({ icon:Icon, label }) => (
                <button key={label}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700 text-sm"><TranslatedText>{label}</TranslatedText></span>
                  </div>
                  <span className="text-gray-400 text-sm">›</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Action Buttons ── */}
          <div className="flex flex-col sm:flex-row gap-3 pb-8">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 text-white py-3 rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-60"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <><Save className="w-5 h-5" /><span><TranslatedText>Save Changes</TranslatedText></span></>
              )}
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white py-3 rounded-xl hover:bg-red-600 transition-colors"
            >
              <LogOut className="w-5 h-5" /><span><TranslatedText>Logout</TranslatedText></span>
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}
