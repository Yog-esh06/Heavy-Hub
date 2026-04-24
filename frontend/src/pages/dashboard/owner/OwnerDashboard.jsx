import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../auth/useAuth";
import { useBookings } from "../../../hooks/useBookings";
import { useListings } from "../../../hooks/useListings";
import { formatDateDisplay } from "../../../utils/dateHelpers";

const OwnerDashboard = () => {
  const { user } = useAuth();
  const { listings, loading: listingsLoading, refetch: refetchListings } = useListings({ ownerId: user?.uid });
  const { bookings, loading: bookingsLoading } = useBookings({ ownerId: user?.uid });
  const [stats, setStats] = useState({
    totalListings: 0,
    activeBookings: 0,
    earningsThisMonth: 0,
    pendingAction: 0,
  });

  useEffect(() => {
    refetchListings();
  }, [refetchListings]);

  useEffect(() => {
    if (!listings || !bookings) return;

    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    setStats({
      totalListings: listings.length,
      activeBookings: bookings.filter((booking) => ["confirmed", "active"].includes(booking.status)).length,
      earningsThisMonth: bookings
        .filter((booking) => booking.status === "completed" && booking.completedAt && new Date(booking.completedAt) >= thisMonthStart)
        .reduce((sum, booking) => sum + (booking.totalAmount || 0), 0),
      pendingAction: bookings.filter((booking) => booking.status === "pending").length,
    });
  }, [bookings, listings]);

  if (listingsLoading || bookingsLoading) {
    return <div className="container mx-auto px-4 py-8">Loading owner dashboard...</div>;
  }

  const previewListings = listings.slice(0, 3);
  const recentBookings = bookings.slice(0, 5);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Owner Dashboard</h1>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-white p-4 shadow">
          <p className="text-sm text-gray-500">Total listings</p>
          <p className="text-2xl font-bold">{stats.totalListings}</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <p className="text-sm text-gray-500">Active bookings</p>
          <p className="text-2xl font-bold">{stats.activeBookings}</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <p className="text-sm text-gray-500">This month earnings</p>
          <p className="text-2xl font-bold">INR {stats.earningsThisMonth.toLocaleString("en-IN")}</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <p className="text-sm text-gray-500">Pending action</p>
          <p className="text-2xl font-bold">{stats.pendingAction}</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent bookings</h2>
            <Link to="/dashboard/owner/bookings" className="text-sm text-blue-600">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {recentBookings.map((booking) => (
              <div key={booking.id} className="rounded-lg bg-white p-4 shadow">
                <p className="font-medium">{booking.vehicleName}</p>
                <p className="text-sm text-gray-500">
                  {formatDateDisplay(booking.startDate)} - {formatDateDisplay(booking.endDate)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">My listings</h2>
            <Link to="/dashboard/owner/listings" className="text-sm text-blue-600">
              View all
            </Link>
          </div>
          {previewListings.length === 0 ? (
            <div className="rounded-lg bg-white p-8 text-center text-gray-500 shadow">
              No listings yet. <Link to="/dashboard/owner/add" className="text-blue-600">Add your first listing</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {previewListings.map((listing) => (
                <div key={listing.id} className="rounded-lg bg-white p-4 shadow">
                  <img src={listing.images?.[0]} alt={listing.name} className="h-36 w-full rounded object-cover" />
                  <h3 className="mt-3 font-semibold">{listing.name}</h3>
                  <p className="text-sm text-gray-500">{listing.type}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;
