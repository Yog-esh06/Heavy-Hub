import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { functions, db } from "../config/firebase";
import { httpsCallable } from "firebase/functions";

/**
 * Create a new vehicle listing (calls Cloud Function)
 */
export const createListing = async (listingData) => {
  try {
    const createListingFn = httpsCallable(functions, "createListing");

    const result = await createListingFn(listingData);

    return result.data;
  } catch (error) {
    console.error("Error creating listing:", error);
    throw error;
  }
};

/**
 * Get all listings for owner
 */
export const getOwnerListings = async (ownerId) => {
  try {
    const q = query(
      collection(db, "vehicles"),
      where("ownerId", "==", ownerId)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching owner listings:", error);
    throw error;
  }
};

/**
 * Get listing by ID
 */
export const getListingById = async (listingId) => {
  try {
    const vehicleRef = doc(db, "vehicles", listingId);
    const vehicleSnap = await getDoc(vehicleRef);

    if (!vehicleSnap.exists()) {
      throw new Error("Listing not found");
    }

    return { id: vehicleSnap.id, ...vehicleSnap.data() };
  } catch (error) {
    console.error("Error fetching listing:", error);
    throw error;
  }
};

/**
 * Update vehicle listing
 */
export const updateListing = async (listingId, updates) => {
  try {
    const vehicleRef = doc(db, "vehicles", listingId);
    await updateDoc(vehicleRef, {
      ...updates,
      updatedAt: new Date(),
    });

    return await getListingById(listingId);
  } catch (error) {
    console.error("Error updating listing:", error);
    throw error;
  }
};

/**
 * Delete vehicle listing (calls Cloud Function)
 */
export const deleteListing = async (listingId) => {
  try {
    const deleteListingFn = httpsCallable(functions, "deleteListing");

    const result = await deleteListingFn({ vehicleId: listingId });

    return result.data;
  } catch (error) {
    console.error("Error deleting listing:", error);
    throw error;
  }
};

/**
 * Toggle listing availability
 */
export const toggleListingAvailability = async (listingId, isAvailable) => {
  try {
    const vehicleRef = doc(db, "vehicles", listingId);
    await updateDoc(vehicleRef, {
      isAvailable,
      updatedAt: new Date(),
    });

    return await getListingById(listingId);
  } catch (error) {
    console.error("Error toggling availability:", error);
    throw error;
  }
};

/**
 * Block dates for a listing
 */
export const blockListingDates = async (listingId, dates) => {
  try {
    const vehicleRef = doc(db, "vehicles", listingId);
    const currentListing = await getListingById(listingId);
    const currentBlockedDates = currentListing.bookedDates || [];

    // Merge new dates
    const uniqueDates = [...new Set([...currentBlockedDates, ...dates])];

    await updateDoc(vehicleRef, {
      bookedDates: uniqueDates,
      updatedAt: new Date(),
    });

    return await getListingById(listingId);
  } catch (error) {
    console.error("Error blocking dates:", error);
    throw error;
  }
};

/**
 * Unblock dates for a listing
 */
export const unblockListingDates = async (listingId, dates) => {
  try {
    const vehicleRef = doc(db, "vehicles", listingId);
    const currentListing = await getListingById(listingId);
    const currentBlockedDates = currentListing.bookedDates || [];

    // Remove dates
    const updatedDates = currentBlockedDates.filter(
      (date) => !dates.includes(date)
    );

    await updateDoc(vehicleRef, {
      bookedDates: updatedDates,
      updatedAt: new Date(),
    });

    return await getListingById(listingId);
  } catch (error) {
    console.error("Error unblocking dates:", error);
    throw error;
  }
};

/**
 * Get listing statistics for owner
 */
export const getListingStats = async (ownerId) => {
  try {
    const listings = await getOwnerListings(ownerId);

    const stats = {
      totalListings: listings.length,
      activeListings: listings.filter((l) => l.status === "active").length,
      soldListings: listings.filter((l) => l.status === "sold").length,
      totalRevenue: 0,
      avgRating:
        listings.reduce((sum, l) => sum + (l.rating || 0), 0) / listings.length || 0,
    };

    return stats;
  } catch (error) {
    console.error("Error fetching listing stats:", error);
    throw error;
  }
};

export const getVehicleById = getListingById;
