const functions = require("firebase-functions");
const admin = require("firebase-admin");

const db = admin.firestore();

/**
 * Triggered when a new booking document is created in Firestore
 * Sends notification to equipment owner
 */
exports.onBookingCreate = functions.firestore
  .document("bookings/{bookingId}")
  .onCreate(async (snap, context) => {
    try {
      const booking = snap.data();

      // Get owner and vehicle details
      const ownerSnap = await db.collection("users").doc(booking.ownerId).get();
      const vehicleSnap = await db.collection("vehicles").doc(booking.vehicleId).get();

      if (!ownerSnap.exists || !vehicleSnap.exists) {
        console.warn("Owner or vehicle not found for booking", context.params.bookingId);
        return;
      }

      const owner = ownerSnap.data();
      const vehicle = vehicleSnap.data();

      // Prepare notification data
      const notificationMessage = `New booking for ${booking.vehicleName}! Renter: ${booking.renterName}, Dates: ${booking.startDate} to ${booking.endDate}`;

      // FUTURE: Send email via SendGrid
      console.log(`Email to ${owner.email}: ${notificationMessage}`);

      // FUTURE: Send push notification via FCM
      console.log(`Push notification to ${booking.ownerId}: ${notificationMessage}`);

      return {
        success: true,
        bookingId: context.params.bookingId,
        notified: true,
      };
    } catch (error) {
      console.error("Error in onBookingCreate:", error);
      throw error;
    }
  });