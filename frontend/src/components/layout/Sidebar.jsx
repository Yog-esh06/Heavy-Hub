import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";

const Sidebar = () => {
  const { activeRole } = useAuth();
  const location = useLocation();

  const navigationItems = {
    renter: [
      { label: "Dashboard", path: "/dashboard/renter", icon: "📊" },
      { label: "Browse Equipment", path: "/browse-rent", icon: "🔍" },
      { label: "My Bookings", path: "/dashboard/renter/bookings", icon: "📋" },
      { label: "Cart", path: "/cart", icon: "🛒" },
      { label: "Profile", path: "/dashboard/renter/profile", icon: "👤" },
    ],
    owner: [
      { label: "Dashboard", path: "/dashboard/owner", icon: "📊" },
      { label: "My Listings", path: "/dashboard/owner/listings", icon: "📝" },
      { label: "Add Listing", path: "/dashboard/owner/add-listing", icon: "➕" },
      { label: "Bookings", path: "/dashboard/owner/bookings", icon: "📋" },
      { label: "Profile", path: "/dashboard/owner/profile", icon: "👤" },
    ],
    driver: [
      { label: "Dashboard", path: "/dashboard/driver", icon: "📊" },
      { label: "Available Jobs", path: "/dashboard/driver/jobs", icon: "💼" },
      { label: "Earnings", path: "/dashboard/driver/earnings", icon: "💰" },
      { label: "Profile", path: "/dashboard/driver/profile", icon: "👤" },
    ],
    admin: [
      { label: "Dashboard", path: "/dashboard/admin", icon: "📊" },
      { label: "Users", path: "/dashboard/admin/users", icon: "👥" },
      { label: "Listings", path: "/dashboard/admin/listings", icon: "📝" },
      { label: "Bookings", path: "/dashboard/admin/bookings", icon: "📋" },
      { label: "Driver Applications", path: "/dashboard/admin/drivers", icon: "🚗" },
    ],
  };

  const items = navigationItems[activeRole] || [];

  return (
    <aside className="bg-gray-50 border-r border-gray-200 w-64 min-h-screen">
      <div className="p-6">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <span className="text-2xl">🚜</span>
          <span>HeavyHub</span>
        </Link>
      </div>

      <nav className="px-3 space-y-1">
        {items.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              location.pathname === item.path
                ? "bg-green-100 text-green-700 font-semibold"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;