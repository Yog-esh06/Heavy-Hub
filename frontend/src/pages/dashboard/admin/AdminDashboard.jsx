// frontend/src/pages/dashboard/admin/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../../../config/firebase';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';

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
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        const listingsSnap = await getDocs(collection(db, 'vehicles'));
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const bookingsSnap = await getDocs(query(collection(db, 'bookings'), where('createdAt', '>=', Timestamp.fromDate(todayStart))));
        const driversSnap = await getDocs(query(collection(db, 'drivers'), where('applicationStatus', '==', 'pending')));
        setStats({
          totalUsers: usersSnap.size,
          totalListings: listingsSnap.size,
          bookingsToday: bookingsSnap.size,
          pendingDrivers: driversSnap.size,
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