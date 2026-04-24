const functions = require("firebase-functions");
const admin = require("firebase-admin");

const db = admin.firestore();

/**
 * Callable Cloud Function: Create a new vehicle listing
 * Validates owner, required fields, and writes to Firestore
 */
exports.createListing = functions.https.onCall(async (data, context) => {
  // Check authentication
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "User must be logged in");
  }

  const ownerId = context.auth.uid;
  const {
    name,
    type,
    brand,
    model,
    year,
    description,
    listingType,
    images,
    location,
    pricePerDay,
    pricePerHour,
    salePrice,
    driverAvailable,
    driverFeePerDay,
    specifications,
  } = data;

  // Validate required fields
  const requiredFields = ["name", "type", "brand", "model", "year", "listingType", "location"];
  for (const field of requiredFields) {
    if (!data[field]) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        `Missing required field: ${field}`
      );
    }
  }

  // Validate pricing based on listing type
  if (["rent", "both"].includes(listingType) && !pricePerDay) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "pricePerDay is required for rent listings"
    );
  }

  if (["sale", "both"].includes(listingType) && !salePrice) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "salePrice is required for sale listings"
    );
  }

  try {
    // Create vehicle document
    const vehicleRef = db.collection("vehicles").doc();
    const vehicleId = vehicleRef.id;

    await vehicleRef.set({
      id: vehicleId,
      ownerId,
      listingType,
      name,
      type,
      brand,
      model,
      year: parseInt(year),
      description: description || "",
      images: images || [],
      documents: {
        rc: "",
        insurance: "",
      },
      location: {
        lat: location.lat,
        lng: location.lng,
        address: location.address || "",
        state: location.state || "",
        district: location.district || "",
      },
      pricePerHour: pricePerHour || 0,
      pricePerDay: pricePerDay || 0,
      salePrice: salePrice || 0,
      driverAvailable: driverAvailable || false,
      driverFeePerDay: driverFeePerDay || 0,
      isAvailable: true,
      bookedDates: [],
      specifications: specifications || {},
      rating: 0,
      reviewCount: 0,
      isVerified: false,
      status: "active",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      success: true,
      vehicleId,
      name,
      status: "active",
    };
  } catch (error) {
    console.error("Error creating listing:", error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError("internal", "Failed to create listing");
  }
});