import { useCallback, useEffect, useState } from "react";
import { cancelBooking as cancelBookingService, createBooking as createBookingService, getUserBookings } from "../services/bookings.service";
import { useAuth } from "../auth/AuthProvider";

export function useBookings(filters = {}) {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBookings = useCallback(async () => {
    if (!user?.id) {
      setBookings([]);
      setLoading(false);
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getUserBookings(user.id, filters);
      setBookings(data);
      return data;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [filters, user?.id]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const createBooking = useCallback(
    async (bookingData) => {
      const created = await createBookingService(bookingData);
      await fetchBookings();
      return created;
    },
    [fetchBookings]
  );

  const cancelBooking = useCallback(
    async (bookingId, reason) => {
      const result = await cancelBookingService(bookingId, reason, user?.id);
      await fetchBookings();
      return result;
    },
    [fetchBookings, user?.id]
  );

  return {
    bookings,
    loading,
    error,
    setBookings,
    fetchBookings,
    refetch: fetchBookings,
    createBooking,
    cancelBooking,
  };
}
