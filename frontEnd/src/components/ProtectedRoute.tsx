import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
interface ProtectedRouteProps {
  children: ReactNode;
}
function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
