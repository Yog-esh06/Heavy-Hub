// frontend/src/pages/dashboard/renter/RenterDashboard.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { useBookings } from '../../../hooks/useBookings';
import { useCart } from '../../../hooks/useCart';
import BookingCard from '../../../components/BookingCard';

const RenterDashboard = () => {
  const { user } = useAuth();
  const { cartCount, cartItems } = useCart();
  const { bookings, loading } = useBookings({ renterId: user.uid, limit: 100 });
  const [stats, setStats] = useState({
    upcoming: 0,
    past: 0,
    totalSpent: 0,
  });

  useEffect(() => {
    if (bookings) {
      const now = new Date();
      const upcoming = bookings.filter(b => new Date(b.startDate) > now && b.status !== 'cancelled').length;
      const past = bookings.filter(b => new Date(b.endDate) < now || b.status === 'completed').length;
      const totalSpent = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
      setStats({ upcoming, past, totalSpent });
    }
  }, [bookings]);

  const recentBookings = bookings?.slice(0, 3) || [];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-200 rounded"></div>)}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Renter Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Upcoming Bookings</p>
          <p className="text-2xl font-bold">{stats.upcoming}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Past Bookings</p>
          <p className="text-2xl font-bold">{stats.past}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Cart Items</p>
          <p className="text-2xl font-bold">{cartCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Total Spent</p>
          <p className="text-2xl font-bold">₹{stats.totalSpent.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 mb-8">
        <Link to="/browse/rent" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Browse Rent
        </Link>
        <Link to="/browse/buy" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          Browse Buy
        </Link>
        <Link to="/dashboard/cart" className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
          View Cart ({cartCount})
        </Link>
        <Link to="/dashboard/bookings" className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
          All Bookings
        </Link>
      </div>

      {/* Recent Bookings */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Bookings</h2>
        {recentBookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            No bookings yet. Start renting equipment!
          </div>
        ) : (
          <div className="space-y-4">
            {recentBookings.map(booking => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RenterDashboard;