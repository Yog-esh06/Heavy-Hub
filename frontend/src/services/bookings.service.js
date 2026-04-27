import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../config/firebase";

export const createBooking = async (bookingData) => {
  try {
    const vehicleRef = doc(db, "vehicles", bookingData.vehicleId);

    const bookingRef = await addDoc(collection(db, "bookings"), {
      ...bookingData,
      status: "confirmed",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    const dates = generateDateRange(bookingData.startDate, bookingData.endDate);
    await updateDoc(vehicleRef, {
      bookedDates: arrayUnion(...dates),
      isAvailable: false,
      updatedAt: serverTimestamp(),
    });

    return bookingRef.id;
  } catch (error) {
    console.error("Error creating booking:", error);
    throw error;
  }
};

export const cancelBooking = async (bookingId, cancellationReason) => {
  try {
    const bookingRef = doc(db, "bookings", bookingId);
    await updateDoc(bookingRef, {
      status: "cancelled",
      cancellationReason,
      updatedAt: serverTimestamp(),
    });

    return bookingId;
  } catch (error) {
    console.error("Error cancelling booking:", error);
    throw error;
  }
};

export const getUserBookingsAsRenter = async (userId) => {
  try {
    const q = query(collection(db, "bookings"), where("renterId", "==", userId));
    const snapshot = await getDocs(q);
    const bookings = snapshot.docs.map((snapshotDoc) => ({
      id: snapshotDoc.id,
      ...snapshotDoc.data(),
    }));

    return bookings.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    throw error;
  }
};

export const getOwnerIncomingBookings = async (ownerId) => {
  try {
    const q = query(collection(db, "bookings"), where("ownerId", "==", ownerId));
    const snapshot = await getDocs(q);
    const bookings = snapshot.docs.map((snapshotDoc) => ({
      id: snapshotDoc.id,
      ...snapshotDoc.data(),
    }));

    return bookings
      .filter((booking) => ["pending", "confirmed", "active"].includes(booking.status))
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  } catch (error) {
    console.error("Error fetching owner bookings:", error);
    throw error;
  }
};

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

export const confirmBooking = async (bookingId) => {
  try {
    const bookingRef = doc(db, "bookings", bookingId);
    await updateDoc(bookingRef, {
      status: "confirmed",
      updatedAt: serverTimestamp(),
    });

    return getBookingById(bookingId);
  } catch (error) {
    console.error("Error confirming booking:", error);
    throw error;
  }
};

export const getDriverBookings = async (driverId) => {
  try {
    const q = query(collection(db, "bookings"), where("driverId", "==", driverId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((snapshotDoc) => ({ id: snapshotDoc.id, ...snapshotDoc.data() }));
  } catch (error) {
    console.error("Error fetching driver bookings:", error);
    throw error;
  }
};

export const getCompletedBookings = async (userId, role = "renter") => {
  try {
    const field = role === "renter" ? "renterId" : "ownerId";
    const q = query(
      collection(db, "bookings"),
      where(field, "==", userId),
      where("status", "==", "completed")
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((snapshotDoc) => ({ id: snapshotDoc.id, ...snapshotDoc.data() }));
  } catch (error) {
    console.error("Error fetching completed bookings:", error);
    throw error;
  }
};

export const updateBookingStatus = async (bookingId, status) => {
  try {
    const bookingRef = doc(db, "bookings", bookingId);
    await updateDoc(bookingRef, {
      status,
      updatedAt: serverTimestamp(),
    });

    return getBookingById(bookingId);
  } catch (error) {
    console.error("Error updating booking status:", error);
    throw error;
  }
};

function generateDateRange(startDate, endDate) {
  const dates = [];
  const current = new Date(startDate);
  const end = new Date(endDate);

  while (current <= end) {
    dates.push(current.toISOString().split("T")[0]);
    current.setDate(current.getDate() + 1);
  }

  return dates;
}
