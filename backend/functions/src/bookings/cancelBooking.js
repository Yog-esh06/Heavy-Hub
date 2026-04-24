const functions = require("firebase-functions");
const admin = require("firebase-admin");

const db = admin.firestore();
const BookingStatus = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  CANCELLED: "cancelled",
};
const RefundPolicy = {
  MORE_THAN_48H: 0.9,
  BETWEEN_24H_48H: 0.5,
  LESS_THAN_24H: 0,
};

/**
 * Callable Cloud Function: Cancel a booking
 * Calculates refund based on cancellation policy, unblocks dates
 */
exports.cancelBooking = functions.https.onCall(async (data, context) => {
  // Check authentication
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "User must be logged in");
  }

  const userId = context.auth.uid;
  const { bookingId, cancellationReason } = data;

  if (!bookingId || !cancellationReason) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Missing required fields"
    );
  }

  try {
    // Get booking
    const bookingSnap = await db.collection("bookings").doc(bookingId).get();
    if (!bookingSnap.exists) {
      throw new functions.https.HttpsError("not-found", "Booking not found");
    }

    const booking = bookingSnap.data();

    // Verify user is renter or owner
    if (booking.renterId !== userId && booking.ownerId !== userId) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "You can only cancel your own bookings"
      );
    }

    // Check if booking can be cancelled
    if (![BookingStatus.PENDING, BookingStatus.CONFIRMED].includes(booking.status)) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        `Cannot cancel booking with status: ${booking.status}`
      );
    }

    // Calculate refund based on cancellation policy
    const refundAmount = calculateRefund(booking.startDate, booking.totalAmount);

    // Update booking
    await db.collection("bookings").doc(bookingId).update({
      status: BookingStatus.CANCELLED,
      cancellationReason,
      refundAmount,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Unblock vehicle dates
    const bookedDates = getDatesInRange(booking.startDate, booking.endDate);
    await db.collection("vehicles").doc(booking.vehicleId).update({
      bookedDates: admin.firestore.FieldValue.arrayRemove(...bookedDates),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // If driver was assigned, mark as available
    if (booking.driverId) {
      await db.collection("drivers").doc(booking.driverId).update({
        isAvailable: true,
        currentJobId: null,
      });

      const batch = db.batch();
      batch.set(db.collection("bookingChats").doc(`${bookingId}__renter_driver`), {
        status: "closed",
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
      batch.set(db.collection("bookingChats").doc(`${bookingId}__driver_owner`), {
        status: "closed",
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
      await batch.commit();
    }

    // Send notifications
    await sendNotification({
      type: "booking_cancelled",
      recipientId: booking.ownerId,
      bookingId,
      vehicleName: booking.vehicleName,
      refundAmount,
    });

    return {
      bookingId,
      status: BookingStatus.CANCELLED,
      refundAmount,
      refundPercentage: (refundAmount / booking.totalAmount) * 100,
    };
  } catch (error) {
    console.error("Error cancelling booking:", error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError("internal", "Failed to cancel booking");
  }
});

/**
 * Helper: Calculate refund based on cancellation policy
 * More than 48hrs: 90% refund
 * 24-48hrs: 50% refund
 * Less than 24hrs: 0% refund
 */
function calculateRefund(startDate, totalAmount) {
  const now = new Date();
  const start = new Date(startDate);
  const hoursUntilStart = (start - now) / (1000 * 60 * 60);

  if (hoursUntilStart > 48) {
    return totalAmount * RefundPolicy.MORE_THAN_48H;
  } else if (hoursUntilStart > 24) {
    return totalAmount * RefundPolicy.BETWEEN_24H_48H;
  } else {
    return totalAmount * RefundPolicy.LESS_THAN_24H;
  }
}

/**
 * Helper: Get array of dates in range (inclusive)
 */
function getDatesInRange(startDate, endDate) {
  const dates = [];
  const current = new Date(startDate);
  const end = new Date(endDate);

  while (current <= end) {
    dates.push(current.toISOString().split("T")[0]);
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

/**
 * Helper: Send notification
 */
async function sendNotification({
  type,
  recipientId,
  bookingId,
  vehicleName,
  refundAmount,
}) {
  // FUTURE: Integrate with SendGrid, Twilio, or Firebase Cloud Messaging
  console.log(
    `Notification [${type}]: User ${recipientId} - ${vehicleName} refund: ₹${refundAmount}`
  );
}
