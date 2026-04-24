const functions = require("firebase-functions");
const admin = require("firebase-admin");

const db = admin.firestore();
const BookingStatus = {
  CONFIRMED: "confirmed",
};
const PaymentStatus = {
  PAID: "paid",
};

/**
 * Callable Cloud Function: Create a new booking
 * Validates vehicle availability, blocks dates, assigns driver if requested
 */
exports.createBooking = functions.https.onCall(async (data, context) => {
  // Check authentication
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "User must be logged in");
  }

  const renterId = context.auth.uid;
  const {
    vehicleId,
    startDate,
    endDate,
    startTime,
    endTime,
    pickupLocation,
    driverRequested,
    notes,
  } = data;

  // Validate inputs
  if (!vehicleId || !startDate || !endDate || !startTime || !endTime) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Missing required booking fields"
    );
  }

  try {
    // Get vehicle details
    const vehicleSnap = await db.collection("vehicles").doc(vehicleId).get();
    if (!vehicleSnap.exists) {
      throw new functions.https.HttpsError("not-found", "Vehicle not found");
    }

    const vehicle = vehicleSnap.data();
    const ownerId = vehicle.ownerId;

    // Parse dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Start date must be before end date"
      );
    }

    // Check for date conflicts
    const bookedDates = vehicle.bookedDates || [];
    const requestedDates = getDatesInRange(startDate, endDate);

    const hasConflict = requestedDates.some((date) => bookedDates.includes(date));
    if (hasConflict) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "Vehicle is not available for the selected dates"
      );
    }

    // Calculate pricing
    const totalDays = getDaysDifference(startDate, endDate) + 1;
    const pricePerDay = vehicle.pricePerDay || 0;
    let driverFee = 0;
    let driverId = null;

    let totalAmount = totalDays * pricePerDay;

    // Handle driver assignment if requested
    if (driverRequested && vehicle.driverAvailable) {
      driverFee = vehicle.driverFeePerDay || 0;
      totalAmount += totalDays * driverFee;

      // Assign nearest available driver
      try {
        const assignmentResult = await assignDriver({
          pickupLocation,
          vehicleType: vehicle.type,
          startDate,
        });

        if (assignmentResult.driverId) {
          driverId = assignmentResult.driverId;
        }
      } catch (error) {
        // Driver assignment failed but continue with booking
        console.warn("Driver assignment failed:", error);
      }
    }

    // Get renter details
    const renterSnap = await db.collection("users").doc(renterId).get();
    const renterData = renterSnap.data();

    // Create booking document
    const bookingRef = db.collection("bookings").doc();
    const bookingId = bookingRef.id;

    await bookingRef.set({
      id: bookingId,
      vehicleId,
      vehicleName: vehicle.name,
      vehicleImage: vehicle.images?.[0] || "",
      renterId,
      renterName: renterData?.displayName || "Guest",
      renterPhone: renterData?.phone || "",
      ownerId,
      driverId,
      driverRequested,
      startDate,
      endDate,
      startTime,
      endTime,
      pickupLocation,
      totalDays,
      pricePerDay,
      driverFee,
      totalAmount,
      status: BookingStatus.CONFIRMED,
      cancellationReason: null,
      refundAmount: null,
      paymentStatus: PaymentStatus.PAID, // Simplified: assume paid for MVP
      notes: notes || "",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    if (driverId) {
      await createBookingChatRooms({
        bookingId,
        renterId,
        ownerId,
        driverId,
        endDate,
      });
    }

    // Update vehicle booked dates
    await db.collection("vehicles").doc(vehicleId).update({
      bookedDates: admin.firestore.FieldValue.arrayUnion(...requestedDates),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Trigger notification to owner
    await sendNotification({
      type: "booking_created",
      recipientId: ownerId,
      bookingId,
      vehicleName: vehicle.name,
      renterName: renterData?.displayName || "Guest",
    });

    return {
      bookingId,
      status: BookingStatus.CONFIRMED,
      totalAmount,
      driver: driverId
        ? { id: driverId, name: "Assigned" } // Placeholder, full details fetched on frontend
        : null,
    };
  } catch (error) {
    console.error("Error creating booking:", error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError("internal", "Failed to create booking");
  }
});

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
 * Helper: Get number of days between two dates
 */
function getDaysDifference(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Helper: Assign nearest available driver using Haversine distance
 */
async function assignDriver({ pickupLocation, vehicleType, startDate }) {
  const driversSnap = await db
    .collection("drivers")
    .where("applicationStatus", "==", "approved")
    .where("isAvailable", "==", true)
    .where("vehicleTypesExperienced", "array-contains", vehicleType)
    .get();

  if (driversSnap.empty) {
    return { driverId: null };
  }

  let nearestDriver = null;
  let minDistance = 50; // 50km search radius

  driversSnap.forEach((doc) => {
    const driver = doc.data();
    const distance = calculateHaversineDistance(
      pickupLocation.lat,
      pickupLocation.lng,
      driver.location.lat,
      driver.location.lng
    );

    if (distance < minDistance) {
      minDistance = distance;
      nearestDriver = { id: doc.id, ...driver };
    }
  });

  if (nearestDriver) {
    // Mark driver as unavailable
    await db.collection("drivers").doc(nearestDriver.id).update({
      isAvailable: false,
      currentJobId: null, // Will be set to bookingId after booking is created
    });

    return { driverId: nearestDriver.id, distance: minDistance };
  }

  return { driverId: null };
}

/**
 * Helper: Haversine formula to calculate distance between two coordinates
 */
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Helper: Send notification (placeholder for email/push)
 */
async function sendNotification({ type, recipientId, bookingId, vehicleName, renterName }) {
  // FUTURE: Integrate with SendGrid, Twilio, or Firebase Cloud Messaging
  console.log(`Notification [${type}]: User ${recipientId} - ${vehicleName} from ${renterName}`);
}

async function createBookingChatRooms({ bookingId, renterId, ownerId, driverId, endDate }) {
  const batch = db.batch();

  const renterDriverRef = db.collection("bookingChats").doc(`${bookingId}__renter_driver`);
  batch.set(renterDriverRef, {
    bookingId,
    channelType: "renter_driver",
    participants: [renterId, driverId],
    status: "active",
    activeUntil: endDate,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    lastMessage: "",
    lastMessageAt: null,
  });

  const driverOwnerRef = db.collection("bookingChats").doc(`${bookingId}__driver_owner`);
  batch.set(driverOwnerRef, {
    bookingId,
    channelType: "driver_owner",
    participants: [driverId, ownerId],
    status: "active",
    activeUntil: endDate,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    lastMessage: "",
    lastMessageAt: null,
  });

  await batch.commit();
}
