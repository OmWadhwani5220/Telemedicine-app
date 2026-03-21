import { getCookie } from "../utils/cookies";
import { useEffect } from "react";

const AdminProtected = ({ children }) => {
  const role = getCookie("role");

  useEffect(() => {
    if (!role || role !== "admin") {
      window.location.href = "http://localhost:5174/login";
    }
  }, [role]);

  if (!role || role !== "admin") return null;

  return children;
};

export default AdminProtected;