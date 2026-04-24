const functions = require("firebase-functions");
const admin = require("firebase-admin");

const db = admin.firestore();
const storage = admin.storage();
const { BookingStatus } = require("../../shared/types/Booking");

/**
 * Callable Cloud Function: Delete a vehicle listing
 * Validates ownership, checks for active bookings, deletes images
 */
exports.deleteListing = functions.https.onCall(async (data, context) => {
  // Check authentication
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "User must be logged in");
  }

  const userId = context.auth.uid;
  const { vehicleId } = data;

  if (!vehicleId) {
    throw new functions.https.HttpsError("invalid-argument", "vehicleId is required");
  }

  try {
    // Get vehicle
    const vehicleSnap = await db.collection("vehicles").doc(vehicleId).get();
    if (!vehicleSnap.exists) {
      throw new functions.https.HttpsError("not-found", "Vehicle not found");
    }

    const vehicle = vehicleSnap.data();

    // Verify ownership
    if (vehicle.ownerId !== userId) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "You can only delete your own listings"
      );
    }

    // Check for active bookings
    const activeBookingsSnap = await db
      .collection("bookings")
      .where("vehicleId", "==", vehicleId)
      .where("status", "in", [BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.ACTIVE])
      .get();

    if (!activeBookingsSnap.empty) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "Cannot delete listing with active bookings"
      );
    }

    // Delete images from Firebase Storage
    if (vehicle.images && vehicle.images.length > 0) {
      for (const imageUrl of vehicle.images) {
        try {
          // Extract file path from URL and delete
          const filePath = extractPathFromStorageUrl(imageUrl, vehicleId);
          await storage.bucket().file(filePath).delete().catch(() => {
            // File may not exist, continue
          });
        } catch (error) {
          console.warn("Error deleting image:", error);
        }
      }
    }

    // Delete vehicle document
    await db.collection("vehicles").doc(vehicleId).delete();

    return {
      success: true,
      vehicleId,
      message: "Listing deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting listing:", error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError("internal", "Failed to delete listing");
  }
});

/**
 * Helper: Extract file path from Firebase Storage URL
 */
function extractPathFromStorageUrl(url, vehicleId) {
  // URLs are typically: https://firebasestorage.googleapis.com/v0/b/.../?alt=media&token=...
  // We need to extract the path: vehicles/{vehicleId}/...
  // For simplicity, construct the expected path
  try {
    const parts = url.split("vehicles");
    if (parts.length > 1) {
      return `vehicles${parts[1].split("?")[0]}`;
    }
  } catch (error) {
    console.warn("Could not extract path from URL:", url);
  }
  return `vehicles/${vehicleId}/image`;
}