import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../../auth/useAuth";
import BookingChatPanel from "../../../components/chat/BookingChatPanel";
import MapView from "../../../components/maps/MapView";
import { getBookingById, updateBookingStatus } from "../../../services/bookings.service";
import { formatDateDisplay } from "../../../utils/dateHelpers";

const JobDetail = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBooking = async () => {
      try {
        const data = await getBookingById(bookingId);
        if (data.driverId && data.driverId !== user?.uid) {
          navigate("/dashboard/driver");
          return;
        }
        setBooking(data);
      } finally {
        setLoading(false);
      }
    };

    loadBooking();
  }, [bookingId, navigate, user?.uid]);

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading job...</div>;
  }

  if (!booking) {
    return <div className="container mx-auto px-4 py-8">Job not found.</div>;
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <button onClick={() => navigate(-1)} className="mb-4 text-blue-600">
        Back
      </button>
      <div className="rounded-lg bg-white p-6 shadow">
        <h1 className="mb-4 text-2xl font-bold">{booking.vehicleName}</h1>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <p>
              <span className="font-medium">Renter:</span> {booking.renterName}
            </p>
            <p>
              <span className="font-medium">Dates:</span> {formatDateDisplay(booking.startDate)} - {formatDateDisplay(booking.endDate)}
            </p>
            <p>
              <span className="font-medium">Pickup time:</span> {booking.startTime}
            </p>
          </div>
          <MapView location={booking.pickupLocation} className="min-h-[220px]" />
        </div>

        {booking.status === "active" ? (
          <button
            onClick={async () => {
              await updateBookingStatus(bookingId, "completed");
              navigate("/dashboard/driver");
            }}
            className="mt-6 w-full rounded bg-green-600 py-2 text-white"
          >
            Mark as completed
          </button>
        ) : null}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <BookingChatPanel
          booking={booking}
          currentUser={user}
          channelType="renter_driver"
          currentUserRole="driver"
          title="Driver <-> Renter Chat"
        />
        <BookingChatPanel
          booking={booking}
          currentUser={user}
          channelType="driver_owner"
          currentUserRole="driver"
          title="Driver <-> Owner Chat"
        />
      </div>
    </div>
  );
};

export default JobDetail;
