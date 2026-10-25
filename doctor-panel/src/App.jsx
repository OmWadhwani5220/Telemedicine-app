import { Routes, Route } from "react-router-dom";

import Dashboard from "./pages/dashboard";
import Appointments from "./pages/Appointments";
import Notifications from "./pages/Notifications";
import Patients from "./pages/Patients";
import PrescriptionUpload from "./pages/PrescriptionUpload";
import VideoCall from "./pages/VideoCall";
import Settings from "./pages/Settings";
import DoctorProfile from "./pages/DoctorProfile";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />

      <Route
        path="/appointments"
        element={<Appointments />}
      />

      <Route
        path="/notifications"
        element={<Notifications />}
      />

      <Route
        path="/patients"
        element={<Patients />}
      />

      <Route
        path="/prescriptions"
        element={<PrescriptionUpload />}
      />

      <Route
        path="/VideoCall"
        element={<VideoCall />}
      />

            <Route
        path="/profile"
        element={<DoctorProfile />}
      />

      <Route
        path="/settings"
        element={<Settings />}
      />
    </Routes>
  );
}

export default App;