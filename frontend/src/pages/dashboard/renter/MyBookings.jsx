import { useState } from "react";
import CancellationModal from "../../../components/booking/CancellationModal";
import BookingCard from "../../../components/booking/BookingCard";
import { useAuth } from "../../../auth/useAuth";
import { useBookings } from "../../../hooks/useBookings";

const MyBookings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const { bookings, loading, refetch, cancelBooking } = useBookings({ renterId: user?.uid });

  const filteredBookings = (bookings || []).filter((booking) => {
    const now = new Date();
    if (activeTab === "upcoming") {
      return new Date(booking.startDate) > now && !["cancelled", "completed"].includes(booking.status);
    }
    if (activeTab === "active") {
      return new Date(booking.startDate) <= now && new Date(booking.endDate) >= now && booking.status !== "cancelled";
    }
    if (activeTab === "past") {
      return new Date(booking.endDate) < now || booking.status === "completed";
    }
    return booking.status === "cancelled";
  });

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading bookings...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">My Bookings</h1>

      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-4">
          {["upcoming", "active", "past", "cancelled"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-2 text-sm font-medium capitalize ${
                activeTab === tab ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {filteredBookings.length === 0 ? (
        <div className="rounded-lg bg-white p-8 text-center text-gray-500 shadow">
          No {activeTab} bookings found.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <div key={booking.id} className="rounded-lg bg-white p-4 shadow">
              <BookingCard booking={booking} />
              {activeTab === "upcoming" && booking.status !== "cancelled" ? (
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={() => {
                      setSelectedBooking(booking);
                      setShowCancelModal(true);
                    }}
                    className="rounded bg-red-100 px-3 py-1 text-sm text-red-600 hover:bg-red-200"
                  >
                    Cancel booking
                  </button>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}

      {showCancelModal && selectedBooking ? (
        <CancellationModal
          isOpen={showCancelModal}
          booking={selectedBooking}
          onClose={() => setShowCancelModal(false)}
          onConfirm={async (bookingId, reason) => {
            await cancelBooking(bookingId, reason);
            setShowCancelModal(false);
            setSelectedBooking(null);
            await refetch();
          }}
        />
      ) : null}
    </div>
  );
};

export default MyBookings;
