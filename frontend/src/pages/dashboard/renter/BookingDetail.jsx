// frontend/src/pages/dashboard/renter/BookingDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { getBookingById, cancelBooking } from '../../../services/bookings.service';
import CancellationModal from '../../../components/CancellationModal';
import MapView from '../../../components/MapView';
import BookingChatPanel from '../../../components/chat/BookingChatPanel';

const BookingDetail = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const data = await getBookingById(bookingId);
        if (data.renterId !== user.uid) {
          setError('You are not authorized to view this booking');
        } else {
          setBooking(data);
        }
      } catch (err) {
        setError('Failed to load booking details');
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [bookingId, user.uid]);

  const handleCancelSuccess = () => {
    setShowCancelModal(false);
    // Refresh booking data
    getBookingById(bookingId).then(setBooking);
  };

  const handleContactOwner = () => {
    if (booking?.ownerPhone) {
      alert(`Owner phone: ${booking.ownerPhone}`);
    } else {
      alert('Owner contact information is not available yet. Please try after the booking is confirmed.');
    }
  };

  const statusSteps = ['pending', 'confirmed', 'active', 'completed'];
  const currentStepIndex = statusSteps.indexOf(booking?.status);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || 'Booking not found'}
        </div>
        <button onClick={() => navigate('/dashboard/bookings')} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">
          Back to Bookings
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="text-blue-600 mb-4">&larr; Back</button>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-2">{booking.vehicleName}</h1>
          <p className="text-gray-600 mb-4">Booking ID: {booking.id}</p>

          {/* Status Timeline */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {statusSteps.map((step, idx) => (
                <div key={step} className="flex-1 text-center">
                  <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${
                    idx <= currentStepIndex ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                  }`}>
                    {idx + 1}
                  </div>
                  <p className="text-xs mt-1 capitalize">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Booking Details</h2>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-gray-600">Dates:</dt>
                  <dd>{new Date(booking.startDate).toDateString()} - {new Date(booking.endDate).toDateString()}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Pickup Time:</dt>
                  <dd>{booking.startTime}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Total Days:</dt>
                  <dd>{booking.totalDays}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Status:</dt>
                  <dd className="capitalize font-medium">{booking.status}</dd>
                </div>
              </dl>

              <h2 className="text-lg font-semibold mt-6 mb-3">Pricing Breakdown</h2>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt>Rent ({booking.totalDays} days × ₹{booking.pricePerDay.toLocaleString('en-IN')})</dt>
                  <dd>₹{(booking.pricePerDay * booking.totalDays).toLocaleString('en-IN')}</dd>
                </div>
                {booking.driverRequested && (
                  <div className="flex justify-between">
                    <dt>Driver Fee ({booking.totalDays} days × ₹{booking.driverFeePerDay.toLocaleString('en-IN')})</dt>
                    <dd>₹{(booking.driverFeePerDay * booking.totalDays).toLocaleString('en-IN')}</dd>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                  <dt>Total Paid</dt>
                  <dd>₹{booking.totalAmount.toLocaleString('en-IN')}</dd>
                </div>
              </dl>

              {/* Driver Card */}
              {booking.driverRequested && booking.driver && (
                <div className="mt-6 border rounded-lg p-3 bg-gray-50">
                  <h3 className="font-semibold">Driver Assigned</h3>
                  <p>Name: {booking.driver.name}</p>
                  <p>Phone: {booking.driver.phone}</p>
                </div>
              )}

              {/* Cancel Button */}
              {(booking.status === 'pending' || booking.status === 'confirmed') && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="mt-6 w-full bg-red-600 text-white py-2 rounded hover:bg-red-700"
                >
                  Cancel Booking
                </button>
              )}
            </div>

            {/* Right Column: Map */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Pickup Location</h2>
              <MapView
                location={booking.pickupLocation}
                zoom={14}
                className="h-64 rounded-lg"
              />
              <button
                onClick={handleContactOwner}
                className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                Contact Owner
              </button>
            </div>
          </div>

          {booking.driverRequested && booking.driverId ? (
            <div className="mt-8">
              <BookingChatPanel
                booking={booking}
                currentUser={user}
                channelType="renter_driver"
                currentUserRole="renter"
                title="Live Chat With Driver"
              />
            </div>
          ) : null}
        </div>
      </div>

      {/* Cancellation Modal */}
      {showCancelModal && (
        <CancellationModal
          booking={booking}
          onClose={() => setShowCancelModal(false)}
          onCancel={handleCancelSuccess}
        />
      )}
    </div>
  );
};

export default BookingDetail;
