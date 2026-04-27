import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../config/firebase";

export const createListing = async (listingData) => {
  try {
    const docRef = await addDoc(collection(db, "vehicles"), {
      ...listingData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return { id: docRef.id };
  } catch (error) {
    console.error("Error creating listing:", error);
    throw error;
  }
};

export const getOwnerListings = async (ownerId) => {
  try {
    const q = query(collection(db, "vehicles"), where("ownerId", "==", ownerId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((snapshotDoc) => ({ id: snapshotDoc.id, ...snapshotDoc.data() }));
  } catch (error) {
    console.error("Error fetching owner listings:", error);
    throw error;
  }
};

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

export const updateListing = async (listingId, updates) => {
  try {
    const vehicleRef = doc(db, "vehicles", listingId);
    await updateDoc(vehicleRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });

    return getListingById(listingId);
  } catch (error) {
    console.error("Error updating listing:", error);
    throw error;
  }
};

export const deleteListing = async (listingId) => {
  try {
    await deleteDoc(doc(db, "vehicles", listingId));
    return { success: true, listingId };
  } catch (error) {
    console.error("Error deleting listing:", error);
    throw error;
  }
};

export const toggleListingAvailability = async (listingId, isAvailable) => {
  try {
    const vehicleRef = doc(db, "vehicles", listingId);
    await updateDoc(vehicleRef, {
      isAvailable,
      updatedAt: serverTimestamp(),
    });

    return getListingById(listingId);
  } catch (error) {
    console.error("Error toggling availability:", error);
    throw error;
  }
};

export const blockListingDates = async (listingId, dates) => {
  try {
    const vehicleRef = doc(db, "vehicles", listingId);
    const currentListing = await getListingById(listingId);
    const currentBlockedDates = currentListing.bookedDates || [];
    const uniqueDates = [...new Set([...currentBlockedDates, ...dates])];

    await updateDoc(vehicleRef, {
      bookedDates: uniqueDates,
      updatedAt: serverTimestamp(),
    });

    return getListingById(listingId);
  } catch (error) {
    console.error("Error blocking dates:", error);
    throw error;
  }
};

export const unblockListingDates = async (listingId, dates) => {
  try {
    const vehicleRef = doc(db, "vehicles", listingId);
    const currentListing = await getListingById(listingId);
    const currentBlockedDates = currentListing.bookedDates || [];
    const updatedDates = currentBlockedDates.filter((date) => !dates.includes(date));

    await updateDoc(vehicleRef, {
      bookedDates: updatedDates,
      updatedAt: serverTimestamp(),
    });

    return getListingById(listingId);
  } catch (error) {
    console.error("Error unblocking dates:", error);
    throw error;
  }
};

export const getListingStats = async (ownerId) => {
  try {
    const listings = await getOwnerListings(ownerId);

    return {
      totalListings: listings.length,
      activeListings: listings.filter((listing) => listing.status === "active").length,
      soldListings: listings.filter((listing) => listing.status === "sold").length,
      totalRevenue: 0,
      avgRating:
        listings.reduce((sum, listing) => sum + (listing.rating || 0), 0) / listings.length || 0,
    };
  } catch (error) {
    console.error("Error fetching listing stats:", error);
    throw error;
  }
};

export const getVehicleById = getListingById;
