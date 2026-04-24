const functions = require("firebase-functions");
const admin = require("firebase-admin");

const db = admin.firestore();
const DRIVER_SEARCH_RADIUS_KM = 50;

/**
 * Callable Cloud Function: Find and assign nearest available driver
 * Uses Haversine formula for distance calculation
 */
exports.assignDriver = functions.https.onCall(async (data, context) => {
  // Check authentication
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "User must be logged in");
  }

  const { pickupLocation, vehicleType, startDate } = data;

  if (!pickupLocation || !vehicleType || !startDate) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Missing required fields: pickupLocation, vehicleType, startDate"
    );
  }

  try {
    // Query approved, available drivers with experience in this vehicle type
    const driversSnap = await db
      .collection("drivers")
      .where("applicationStatus", "==", "approved")
      .where("isAvailable", "==", true)
      .where("vehicleTypesExperienced", "array-contains", vehicleType)
      .get();

    if (driversSnap.empty) {
      return {
        success: false,
        driverId: null,
        message: "No drivers available in your area",
      };
    }

    // Find nearest driver within search radius
    let nearestDriver = null;
    let minDistance = DRIVER_SEARCH_RADIUS_KM;

    driversSnap.forEach((doc) => {
      const driver = doc.data();

      if (!driver.location || driver.location.lat === null) {
        return; // Skip drivers without location
      }

      const distance = calculateHaversineDistance(
        pickupLocation.lat,
        pickupLocation.lng,
        driver.location.lat,
        driver.location.lng
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearestDriver = {
          id: doc.id,
          ...driver,
          distance: distance.toFixed(1),
        };
      }
    });

    if (!nearestDriver) {
      return {
        success: false,
        driverId: null,
        message: `No drivers found within ${DRIVER_SEARCH_RADIUS_KM}km`,
      };
    }

    // Mark driver as unavailable for this booking
    await db.collection("drivers").doc(nearestDriver.id).update({
      isAvailable: false,
      currentJobId: null, // Will be set to bookingId separately
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      success: true,
      driverId: nearestDriver.id,
      driver: {
        id: nearestDriver.id,
        name: nearestDriver.name,
        phone: nearestDriver.phone,
        rating: nearestDriver.rating,
        reviewCount: nearestDriver.reviewCount,
        distanceKm: parseFloat(nearestDriver.distance),
        experienceYears: nearestDriver.experienceYears,
        vehicleTypesExperienced: nearestDriver.vehicleTypesExperienced,
      },
    };
  } catch (error) {
    console.error("Error assigning driver:", error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError("internal", "Failed to assign driver");
  }
});

/**
 * Helper: Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Start latitude
 * @param {number} lon1 - Start longitude
 * @param {number} lat2 - End latitude
 * @param {number} lon2 - End longitude
 * @returns {number} Distance in kilometers
 */
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers

  // Convert degrees to radians
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  // Haversine formula
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

/**
 * Helper: Convert degrees to radians
 */
function toRad(degrees) {
  return (degrees * Math.PI) / 180;
}