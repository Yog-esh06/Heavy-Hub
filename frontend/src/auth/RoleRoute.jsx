import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import Spinner from "../components/ui/Spinner";
import { useAuth } from "./useAuth";

const RoleRoute = ({ children, allowedRoles = [], requiredRole }) => {
  const { isAuthenticated, loading, roles, activeRole } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const acceptedRoles = allowedRoles.length > 0 ? allowedRoles : requiredRole ? [requiredRole] : [];
  const hasAccess = acceptedRoles.length === 0 || acceptedRoles.some((role) => roles.includes(role));

  if (!hasAccess) {
    const fallbackRole = activeRole || roles[0] || "renter";
    return <Navigate to={`/dashboard/${fallbackRole}`} replace />;
  }

  return children || <Outlet />;
};

export default RoleRoute;
