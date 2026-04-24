import { useState } from "react";
import { useAuth } from "../../../auth/useAuth";
import BookingChatPanel from "../../../components/chat/BookingChatPanel";
import { updateBookingStatus } from "../../../services/bookings.service";
import { useBookings } from "../../../hooks/useBookings";
import { formatDateDisplay } from "../../../utils/dateHelpers";

const IncomingBookings = () => {
  const { user } = useAuth();
  const { bookings, loading, error, refetch } = useBookings({ ownerId: user?.uid });
  const [activeTab, setActiveTab] = useState("pending");

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading incoming bookings...</div>;
  }

  if (error) {
    return <div className="container mx-auto px-4 py-8 text-red-600">Error: {error}</div>;
  }

  const filtered = bookings.filter((booking) => booking.status === activeTab);
  const earnings = bookings
    .filter((booking) => booking.status === "completed")
    .reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Incoming Bookings</h1>
        <div className="rounded-lg bg-white px-4 py-2 shadow">
          <p className="text-sm text-gray-500">Completed earnings</p>
          <p className="text-xl font-bold text-green-600">INR {earnings.toLocaleString("en-IN")}</p>
        </div>
      </div>

      <div className="mb-6 border-b border-gray-200 overflow-x-auto">
        <nav className="flex space-x-4">
          {["pending", "confirmed", "active", "completed", "cancelled"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap px-3 py-2 text-sm font-medium capitalize ${
                activeTab === tab ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      <div className="space-y-4">
        {filtered.map((booking) => (
          <div key={booking.id} className="rounded-lg bg-white p-4 shadow">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="font-semibold">{booking.vehicleName}</h3>
                <p className="text-sm text-gray-600">{booking.renterName || "Unknown renter"}</p>
                <p className="text-sm text-gray-500">
                  {formatDateDisplay(booking.startDate)} - {formatDateDisplay(booking.endDate)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {activeTab === "pending" ? (
                  <>
                    <button
                      onClick={async () => {
                        await updateBookingStatus(booking.id, "confirmed");
                        await refetch();
                      }}
                      className="rounded bg-green-600 px-3 py-1 text-sm text-white"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={async () => {
                        await updateBookingStatus(booking.id, "cancelled");
                        await refetch();
                      }}
                      className="rounded bg-red-600 px-3 py-1 text-sm text-white"
                    >
                      Reject
                    </button>
                  </>
                ) : null}
                {activeTab === "active" ? (
                  <button
                    onClick={async () => {
                      await updateBookingStatus(booking.id, "completed");
                      await refetch();
                    }}
                    className="rounded bg-blue-600 px-3 py-1 text-sm text-white"
                  >
                    Mark completed
                  </button>
                ) : null}
              </div>
            </div>

            {booking.driverId ? (
              <div className="mt-5">
                <BookingChatPanel
                  booking={booking}
                  currentUser={user}
                  channelType="driver_owner"
                  currentUserRole="owner"
                  title="Owner <-> Driver Chat"
                />
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
};

export default IncomingBookings;
