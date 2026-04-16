import { Navigate } from "react-router-dom";

const ProtectedRouteUser = ({ children }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  if (!token || !user) {
    return <Navigate to="/login-user" replace />;
  }

  if (user.role !== "user") {
    return <Navigate to="/login-user" replace />;
  }

  return children;
};

export default ProtectedRouteUser;
