import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { useCart } from "../../store/CartContext";
import Button from "../ui/Button";

const Navbar = () => {
  const { user, roles, activeRole, isAuthenticated, signOutUser, switchRole } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOutUser();
      navigate("/");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const handleSwitchRole = (role) => {
    switchRole(role);
    navigate(`/dashboard/${role}`);
    setUserMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-gray-900">
            <span className="text-2xl">🚜</span>
            <span>HeavyHub</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/browse-rent"
              className={`text-sm font-medium transition-colors ${
                location.pathname.includes("browse-rent")
                  ? "text-green-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Browse Rent
            </Link>
            <Link
              to="/browse-buy"
              className={`text-sm font-medium transition-colors ${
                location.pathname.includes("browse-buy")
                  ? "text-green-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Browse Buy
            </Link>
            <a
              href="#how-it-works"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              How it Works
            </a>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                {/* Cart Icon */}
                {(activeRole === "renter" || !activeRole) && (
                  <Link
                    to="/cart"
                    className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293a1 1 0 00-.263 1.157l1.905 5.44A1 1 0 007.414 23h9.172a1 1 0 00.98-.726l1.906-5.44a1 1 0 00-.263-1.157L17 13m0 0a2 2 0 100-4 2 2 0 000 4zm-8 5a1 1 0 11-2 0 1 1 0 012 0zm8 0a1 1 0 11-2 0 1 1 0 012 0z"
                      />
                    </svg>
                    {totalItems > 0 && (
                      <span className="absolute top-0 right-0 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {totalItems}
                      </span>
                    )}
                  </Link>
                )}

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    {user?.photoURL && (
                      <img
                        src={user.photoURL}
                        alt={user.displayName}
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                    <span className="text-sm font-medium text-gray-900 hidden sm:block">
                      {user?.displayName}
                    </span>
                  </button>

                  {/* Dropdown Menu */}
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                      <Link
                        to={`/dashboard/${activeRole || "renter"}`}
                        className="block px-4 py-2 text-sm text-gray-900 hover:bg-gray-100"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Dashboard
                      </Link>

                      {/* Role Switcher */}
                      {roles.length > 1 && (
                        <>
                          <div className="border-t border-gray-200 my-1" />
                          <p className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase">
                            Switch Role
                          </p>
                          {roles.map((role) => (
                            <button
                              key={role}
                              onClick={() => handleSwitchRole(role)}
                              className={`w-full text-left px-4 py-2 text-sm ${
                                activeRole === role
                                  ? "bg-green-50 text-green-600 font-semibold"
                                  : "text-gray-900 hover:bg-gray-100"
                              }`}
                            >
                              {role.charAt(0).toUpperCase() + role.slice(1)}
                            </button>
                          ))}
                        </>
                      )}

                      <div className="border-t border-gray-200 my-1" />
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link to="/login">
                <Button variant="primary" size="sm">
                  Sign In
                </Button>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link
              to="/browse-rent"
              className="block px-4 py-2 text-sm text-gray-900 hover:bg-gray-100 rounded"
              onClick={() => setMobileMenuOpen(false)}
            >
              Browse Rent
            </Link>
            <Link
              to="/browse-buy"
              className="block px-4 py-2 text-sm text-gray-900 hover:bg-gray-100 rounded"
              onClick={() => setMobileMenuOpen(false)}
            >
              Browse Buy
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;