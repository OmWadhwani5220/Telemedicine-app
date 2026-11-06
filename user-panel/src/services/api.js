const BASE_URL = "http://localhost:5000";

/* ─────────────────────────────────────────
   Helpers
───────────────────────────────────────── */
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (res) => {
  if (res.status === 401) {
    localStorage.clear();
    window.location.href = "http://localhost:5173/login";
    return null;
  }
  return res.json();
};

/* ─────────────────────────────────────────
   AUTH
───────────────────────────────────────── */
export const loginUser = async (email, password) => {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(res);
};

export const getAuthProfile = async () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const res = await fetch(`${BASE_URL}/api/auth/profile`, {
      headers: getAuthHeaders(),
      credentials: "include",
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
};

export const logoutUser = async () => {
  try {
    await fetch(`${BASE_URL}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch (err) {
    console.error("Logout error:", err);
  }
  localStorage.removeItem("token");
  localStorage.removeItem("name");
  localStorage.removeItem("role");
};

/* ─────────────────────────────────────────
   PATIENT PROFILE
───────────────────────────────────────── */
export const getPatientProfile = async () => {
  try {
    const res = await fetch(`${BASE_URL}/api/patient/profile`, {
      headers: getAuthHeaders(),
      credentials: "include",
    });
    if (!res.ok) return null;
    return res.json();
  } catch (err) {
    console.error("Get patient profile error:", err);
    return null;
  }
};

export const updatePatientProfile = async (data) => {
  const res = await fetch(`${BASE_URL}/api/patient/profile`, {
    method: "PUT",
    headers: getAuthHeaders(),
    credentials: "include",
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

/* ─────────────────────────────────────────
   DOCTORS
───────────────────────────────────────── */
export const getVerifiedDoctors = async () => {
  try {
    const res = await fetch(`${BASE_URL}/api/patient/doctors`, {
      headers: getAuthHeaders(),
      credentials: "include",
    });
    if (!res.ok) return [];
    return res.json();
  } catch (err) {
    console.error("Get doctors error:", err);
    return [];
  }
};

/* ─────────────────────────────────────────
   APPOINTMENTS
───────────────────────────────────────── */
export const bookAppointment = async (appointmentData) => {
  const res = await fetch(`${BASE_URL}/api/patient/appointments`, {
    method: "POST",
    headers: getAuthHeaders(),
    credentials: "include",
    body: JSON.stringify(appointmentData),
  });
  return handleResponse(res);
};

export const getMyAppointments = async () => {
  try {
    const res = await fetch(`${BASE_URL}/api/patient/appointments`, {
      headers: getAuthHeaders(),
      credentials: "include",
    });
    if (!res.ok) return [];
    return res.json();
  } catch (err) {
    console.error("Get appointments error:", err);
    return [];
  }
};

/* ─────────────────────────────────────────
   SLOTS
───────────────────────────────────────── */
export const getAvailableSlots = async (doctorId, date) => {
  try {
    const res = await fetch(
      `${BASE_URL}/api/patient/doctors/${doctorId}/slots?date=${date}`,
      { headers: getAuthHeaders(), credentials: "include" }
    );
    if (!res.ok) return null;
    return res.json();
  } catch (err) {
    console.error("Get slots error:", err);
    return null;
  }
};

/* ─────────────────────────────────────────
   AI SYMPTOM CHECKER
   Calls the FastAPI ai-service directly on port 8001.
   No auth header needed — it's an internal service.
───────────────────────────────────────── */
const AI_SERVICE_URL = "http://localhost:8001";

export const checkSymptoms = async (payload) => {
  try {
    const res = await fetch(`${AI_SERVICE_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    // 422 means the LLM couldn't extract recognisable symptoms
    if (res.status === 422) {
      const err = await res.json();
      return { detail: err.detail || "Could not extract symptoms from your description." };
    }

    if (!res.ok) {
      return { detail: "AI service error. Please try again." };
    }

    return res.json();
  } catch (err) {
    console.error("checkSymptoms error:", err);
    return { detail: "Could not reach the AI service. Make sure it is running on port 8001." };
  }
};
