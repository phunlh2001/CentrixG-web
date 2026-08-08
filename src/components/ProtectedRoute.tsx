import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthService } from "../api/authApi";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const user = AuthService.getCurrentUser();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
