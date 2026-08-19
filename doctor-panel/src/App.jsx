// ─── doctor-panel/src/App.jsx  (UPDATED) ───────────────────────────────────────
// Changes: Added VideoCall route

import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/dashboard";
import Appointments from "./pages/Appointments";
import Notifications from "./pages/Notifications";
import Patients from "./pages/Patients";
import PrescriptionUpload from "./pages/PrescriptionUpload";
import VideoCall from "./pages/VideoCall";   // ✅ NEW

function App() {
  return (
    <Routes>
        <Route path="/"              element={<Dashboard />} />
      <Route path="/appointments"  element={<Appointments />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/patients"      element={<Patients />} />
      <Route path="/prescriptions" element={<PrescriptionUpload />} />
      <Route path="/VideoCall"    element={<VideoCall />} />   {/* ✅ NEW */}
    </Routes>
  );
}

export default App;
