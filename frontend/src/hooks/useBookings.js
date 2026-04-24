import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../auth/useAuth";
import * as bookingsService from "../services/bookings.service";

export const useBookings = (options = {}) => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBookings = useCallback(
    async (roleOverride) => {
      const role =
        roleOverride ||
        (options.ownerId ? "owner" : options.driverId ? "driver" : "renter");
      const userId = options.ownerId || options.driverId || options.renterId || user?.uid;

      if (!userId) return [];

      setLoading(true);
      setError(null);

      try {
        let data = [];
        if (role === "owner") {
          data = await bookingsService.getOwnerIncomingBookings(userId);
        } else if (role === "driver") {
          data = await bookingsService.getDriverBookings(userId);
        } else {
          data = await bookingsService.getUserBookingsAsRenter(userId);
        }

        setBookings(data);
        return data;
      } catch (err) {
        setError(err.message);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [options.driverId, options.ownerId, options.renterId, user?.uid]
  );

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const createBooking = useCallback(
    async (bookingData) => {
      setLoading(true);
      setError(null);
      try {
        const result = await bookingsService.createBooking(bookingData);
        await fetchBookings("renter");
        return result;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchBookings]
  );

  const cancelBooking = useCallback(
    async (bookingId, reason) => {
      setLoading(true);
      setError(null);
      try {
        const result = await bookingsService.cancelBooking(bookingId, reason);
        await fetchBookings();
        return result;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchBookings]
  );

  return {
    bookings,
    loading,
    error,
    fetchBookings,
    refetch: fetchBookings,
    createBooking,
    cancelBooking,
  };
};
