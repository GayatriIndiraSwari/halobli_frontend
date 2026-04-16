import { Navigate } from "react-router-dom";

export default function ProtectedRouteAdmin({ children }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token || role !== "admin") {
    return <Navigate to="/login-admin" replace />;
  }

  return children;
}

