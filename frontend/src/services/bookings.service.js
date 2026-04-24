import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { functions, db } from "../config/firebase";
import { httpsCallable } from "firebase/functions";

/**
 * Create a new booking (calls Cloud Function)
 */
export const createBooking = async (bookingData) => {
  try {
    const createBookingFn = httpsCallable(functions, "createBooking");

    const result = await createBookingFn(bookingData);

    return result.data;
  } catch (error) {
    console.error("Error creating booking:", error);
    throw error;
  }
};

/**
 * Cancel a booking (calls Cloud Function)
 */
export const cancelBooking = async (bookingId, cancellationReason) => {
  try {
    const cancelBookingFn = httpsCallable(functions, "cancelBooking");

    const result = await cancelBookingFn({
      bookingId,
      cancellationReason,
    });

    return result.data;
  } catch (error) {
    console.error("Error cancelling booking:", error);
    throw error;
  }
};

/**
 * Get all bookings for current user (as renter)
 */
export const getUserBookingsAsRenter = async (userId) => {
  try {
    const q = query(
      collection(db, "bookings"),
      where("renterId", "==", userId)
    );

    const snapshot = await getDocs(q);
    const bookings = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    // Sort by date descending
    return bookings.sort(
      (a, b) => new Date(b.startDate) - new Date(a.startDate)
    );
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    throw error;
  }
};

/**
 * Get all bookings for owner's vehicles
 */
export const getOwnerIncomingBookings = async (ownerId) => {
  try {
    const q = query(
      collection(db, "bookings"),
      where("ownerId", "==", ownerId)
    );

    const snapshot = await getDocs(q);
    const bookings = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    // Filter for pending/confirmed/active bookings
    return bookings
      .filter((b) =>
        ["pending", "confirmed", "active"].includes(b.status)
      )
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  } catch (error) {
    console.error("Error fetching owner bookings:", error);
    throw error;
  }
};

/**
 * Get booking by ID
 */
export const getBookingById = async (bookingId) => {
  try {
    const bookingRef = doc(db, "bookings", bookingId);
    const bookingSnap = await getDoc(bookingRef);

    if (!bookingSnap.exists()) {
      throw new Error("Booking not found");
    }

    return { id: bookingSnap.id, ...bookingSnap.data() };
  } catch (error) {
    console.error("Error fetching booking:", error);
    throw error;
  }
};

/**
 * Confirm booking (owner accepts)
 */
export const confirmBooking = async (bookingId) => {
  try {
    const bookingRef = doc(db, "bookings", bookingId);
    await updateDoc(bookingRef, {
      status: "confirmed",
      updatedAt: new Date(),
    });

    return await getBookingById(bookingId);
  } catch (error) {
    console.error("Error confirming booking:", error);
    throw error;
  }
};

/**
 * Get bookings for a driver
 */
export const getDriverBookings = async (driverId) => {
  try {
    const q = query(
      collection(db, "bookings"),
      where("driverId", "==", driverId)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching driver bookings:", error);
    throw error;
  }
};

/**
 * Get completed bookings for review
 */
export const getCompletedBookings = async (userId, role = "renter") => {
  try {
    const field = role === "renter" ? "renterId" : "ownerId";
    const q = query(
      collection(db, "bookings"),
      where(field, "==", userId),
      where("status", "==", "completed")
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching completed bookings:", error);
    throw error;
  }
};

/**
 * Update booking status
 */
export const updateBookingStatus = async (bookingId, status) => {
  try {
    const bookingRef = doc(db, "bookings", bookingId);
    await updateDoc(bookingRef, {
      status,
      updatedAt: new Date(),
    });

    return await getBookingById(bookingId);
  } catch (error) {
    console.error("Error updating booking status:", error);
    throw error;
  }
};