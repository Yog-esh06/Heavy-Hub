import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { isSupabaseConfigured, supabase } from "../../../config/supabase";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalListings: 0,
    bookingsToday: 0,
    pendingDrivers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!isSupabaseConfigured) {
        setLoading(false);
        return;
      }

      try {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const [{ count: totalUsers }, { count: totalListings }, { count: bookingsToday }, { count: pendingDrivers }] =
          await Promise.all([
            supabase.from("users").select("*", { count: "exact", head: true }),
            supabase.from("vehicles").select("*", { count: "exact", head: true }),
            supabase.from("bookings").select("*", { count: "exact", head: true }).gte("created_at", todayStart.toISOString()),
            supabase.from("drivers").select("*", { count: "exact", head: true }).eq("application_status", "pending"),
          ]);

        setStats({
          totalUsers: totalUsers || 0,
          totalListings: totalListings || 0,
          bookingsToday: bookingsToday || 0,
          pendingDrivers: pendingDrivers || 0,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="container mx-auto px-4 py-8 text-center">Loading dashboard...</div>;
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-900">
          Configure Supabase in `frontend/.env` to use the admin dashboard.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Total Users</p>
          <p className="text-2xl font-bold">{stats.totalUsers}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Total Listings</p>
          <p className="text-2xl font-bold">{stats.totalListings}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Bookings Today</p>
          <p className="text-2xl font-bold">{stats.bookingsToday}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Pending Driver Apps</p>
          <p className="text-2xl font-bold">{stats.pendingDrivers}</p>
          {stats.pendingDrivers > 0 && (
            <Link to="/dashboard/admin/drivers" className="text-blue-600 text-sm mt-2 inline-block">Review →</Link>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/dashboard/admin/users" className="bg-blue-50 p-6 rounded-lg text-center hover:bg-blue-100">
          <h3 className="font-semibold">Manage Users</h3>
          <p className="text-sm text-gray-600">View, edit roles</p>
        </Link>
        <Link to="/dashboard/admin/listings" className="bg-green-50 p-6 rounded-lg text-center hover:bg-green-100">
          <h3 className="font-semibold">Manage Listings</h3>
          <p className="text-sm text-gray-600">Verify, delete listings</p>
        </Link>
        <Link to="/dashboard/admin/drivers" className="bg-purple-50 p-6 rounded-lg text-center hover:bg-purple-100">
          <h3 className="font-semibold">Driver Approvals</h3>
          <p className="text-sm text-gray-600">Review applications</p>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
