import { Navigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import AdminDashboard from "./admin/AdminDashboard";
import DriverDashboard from "./driver/DriverDashboard";
import OwnerDashboard from "./owner/OwnerDashboard";
import RenterDashboard from "./renter/RenterDashboard";

const DashboardRouter = () => {
  const { user, roles, loading, activeRole, switchRole } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!roles || roles.length === 0) {
    return <Navigate to="/login" replace />;
  }

  const currentRole = activeRole || roles[0];

  const renderDashboard = () => {
    switch (currentRole) {
      case "owner":
        return <OwnerDashboard />;
      case "driver":
        return <DriverDashboard />;
      case "admin":
        return <AdminDashboard />;
      case "renter":
      default:
        return <RenterDashboard />;
    }
  };

  return (
    <div>
      {roles.length > 1 ? (
        <div className="flex justify-end border-b border-gray-200 bg-gray-100 px-4 py-2">
          <select
            value={currentRole}
            onChange={(event) => switchRole(event.target.value)}
            className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm"
          >
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>
      ) : null}
      {renderDashboard()}
    </div>
  );
};

export default DashboardRouter;
