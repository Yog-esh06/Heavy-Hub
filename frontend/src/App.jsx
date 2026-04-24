import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./auth/ProtectedRoute";
import RoleRoute from "./auth/RoleRoute";
import LoginPage from "./pages/auth/LoginPage";
import DashboardRouter from "./pages/dashboard/DashboardRouter";
import AdminDashboard from "./pages/dashboard/admin/AdminDashboard";
import ManageListings from "./pages/dashboard/admin/ManageListings";
import ManageUsers from "./pages/dashboard/admin/ManageUsers";
import DriverApplication from "./pages/dashboard/driver/DriverApplication";
import DriverDashboard from "./pages/dashboard/driver/DriverDashboard";
import JobDetail from "./pages/dashboard/driver/JobDetail";
import AddListing from "./pages/dashboard/owner/AddListing";
import EditListing from "./pages/dashboard/owner/EditListing";
import IncomingBookings from "./pages/dashboard/owner/IncomingBookings";
import MyListings from "./pages/dashboard/owner/MyListings";
import BookingDetail from "./pages/dashboard/renter/BookingDetail";
import Cart from "./pages/dashboard/renter/Cart";
import MyBookings from "./pages/dashboard/renter/MyBookings";
import FloatingHelpWidget from "./components/assistant/FloatingHelpWidget";
import BrowseBuy from "./pages/public/BrowseBuy";
import BrowseRent from "./pages/public/BrowseRent";
import LandingPage from "./pages/public/LandingPage";
import SearchResults from "./pages/public/SearchResults";
import VehicleDetail from "./pages/public/VehicleDetail";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/browse/rent" element={<BrowseRent />} />
        <Route path="/browse/buy" element={<BrowseBuy />} />
        <Route path="/vehicle/:vehicleId" element={<VehicleDetail />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardRouter />} />
          <Route path="/dashboard/renter" element={<DashboardRouter />} />
          <Route path="/dashboard/renter/bookings" element={<MyBookings />} />
          <Route path="/dashboard/renter/cart" element={<Cart />} />
          <Route path="/dashboard/cart" element={<Cart />} />
          <Route path="/dashboard/bookings" element={<MyBookings />} />
          <Route path="/dashboard/renter/booking/:bookingId" element={<BookingDetail />} />
          <Route path="/dashboard/owner/listings" element={<MyListings />} />
          <Route path="/dashboard/owner/add" element={<AddListing />} />
          <Route path="/dashboard/owner/edit/:vehicleId" element={<EditListing />} />
          <Route path="/dashboard/owner/bookings" element={<IncomingBookings />} />
          <Route path="/dashboard/driver/application" element={<DriverApplication />} />
          <Route path="/dashboard/driver" element={<DriverDashboard />} />
          <Route path="/dashboard/driver/job/:bookingId" element={<JobDetail />} />

          <Route element={<RoleRoute allowedRoles={["admin"]} />}>
            <Route path="/dashboard/admin" element={<AdminDashboard />} />
            <Route path="/dashboard/admin/users" element={<ManageUsers />} />
            <Route path="/dashboard/admin/listings" element={<ManageListings />} />
          </Route>
        </Route>

        <Route path="*" element={<LandingPage />} />
      </Routes>
      <FloatingHelpWidget />
    </>
  );
}

export default App;
