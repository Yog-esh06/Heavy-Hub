import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { functions, db } from "../config/firebase";
import { httpsCallable } from "firebase/functions";

/**
 * Assign nearest available driver (calls Cloud Function)
 */
export const assignNearestDriver = async (pickupLocation, vehicleType, startDate) => {
  try {
    const assignDriverFn = httpsCallable(functions, "assignDriver");

    const result = await assignDriverFn({
      pickupLocation,
      vehicleType,
      startDate,
    });

    return result.data;
  } catch (error) {
    console.error("Error assigning driver:", error);
    throw error;
  }
};

/**
 * Apply as a driver
 */
export const applyAsDriver = async (driverData) => {
  try {
    const driversRef = collection(db, "drivers");
    const driverDocRef = doc(driversRef, driverData.uid);

    await setDoc(driverDocRef, {
      ...driverData,
      applicationStatus: "pending",
      isAvailable: true,
      currentJobId: null,
      rating: 0,
      reviewCount: 0,
      totalJobsCompleted: 0,
      createdAt: new Date(),
    });

    return { id: driverDocRef.id, ...driverData };
  } catch (error) {
    console.error("Error applying as driver:", error);
    throw error;
  }
};

/**
 * Get driver profile by ID
 */
export const getDriverById = async (driverId) => {
  try {
    const driverRef = doc(db, "drivers", driverId);
    const driverSnap = await getDoc(driverRef);

    if (!driverSnap.exists()) {
      throw new Error("Driver not found");
    }

    return { id: driverSnap.id, ...driverSnap.data() };
  } catch (error) {
    console.error("Error fetching driver:", error);
    throw error;
  }
};

export const getDriverProfile = getDriverById;

/**
 * Get nearby drivers (public list for map display)
 */
export const getNearbyDrivers = async (location, radiusKm = 50) => {
  try {
    const q = query(
      collection(db, "drivers"),
      where("applicationStatus", "==", "approved"),
      where("isAvailable", "==", true)
    );

    const snapshot = await getDocs(q);
    const drivers = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    // Filter by radius (client-side)
    return drivers.filter((driver) => {
      if (!driver.location || driver.location.lat === null) return false;

      const distance = calculateDistance(
        location.lat,
        location.lng,
        driver.location.lat,
        driver.location.lng
      );

      return distance <= radiusKm;
    });
  } catch (error) {
    console.error("Error fetching nearby drivers:", error);
    throw error;
  }
};

/**
 * Get driver application status
 */
export const getDriverApplicationStatus = async (userId) => {
  try {
    const driverRef = doc(db, "drivers", userId);
    const driverSnap = await getDoc(driverRef);

    if (!driverSnap.exists()) {
      return null; // Not applied
    }

    const driver = driverSnap.data();
    return {
      id: driverSnap.id,
      status: driver.applicationStatus,
      createdAt: driver.createdAt,
    };
  } catch (error) {
    console.error("Error fetching driver application:", error);
    throw error;
  }
};

/**
 * Update driver availability
 */
export const updateDriverAvailability = async (driverId, isAvailable) => {
  try {
    const driverRef = doc(db, "drivers", driverId);
    await updateDoc(driverRef, {
      isAvailable,
      updatedAt: new Date(),
    });

    return await getDriverById(driverId);
  } catch (error) {
    console.error("Error updating driver availability:", error);
    throw error;
  }
};

/**
 * Update driver current job
 */
export const updateDriverCurrentJob = async (driverId, bookingId) => {
  try {
    const driverRef = doc(db, "drivers", driverId);
    await updateDoc(driverRef, {
      currentJobId: bookingId,
      isAvailable: false,
      updatedAt: new Date(),
    });

    return await getDriverById(driverId);
  } catch (error) {
    console.error("Error updating driver job:", error);
    throw error;
  }
};

/**
 * Get all drivers (admin)
 */
export const getAllDrivers = async () => {
  try {
    const q = query(collection(db, "drivers"));

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching drivers:", error);
    throw error;
  }
};

/**
 * Get pending driver applications (admin)
 */
export const getPendingDriverApplications = async () => {
  try {
    const q = query(
      collection(db, "drivers"),
      where("applicationStatus", "==", "pending")
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching pending applications:", error);
    throw error;
  }
};

/**
 * Approve driver application (admin)
 */
export const approveDriverApplication = async (driverId, userId) => {
  try {
    const driverRef = doc(db, "drivers", driverId);
    await updateDoc(driverRef, {
      applicationStatus: "approved",
      isVerified: true,
      updatedAt: new Date(),
    });

    // Add driver role to user
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    const currentRoles = userSnap.data().roles || [];

    if (!currentRoles.includes("driver")) {
      await updateDoc(userRef, {
        roles: [...currentRoles, "driver"],
      });
    }

    return await getDriverById(driverId);
  } catch (error) {
    console.error("Error approving driver:", error);
    throw error;
  }
};

/**
 * Reject driver application (admin)
 */
export const rejectDriverApplication = async (driverId) => {
  try {
    const driverRef = doc(db, "drivers", driverId);
    await updateDoc(driverRef, {
      applicationStatus: "rejected",
      updatedAt: new Date(),
    });

    return await getDriverById(driverId);
  } catch (error) {
    console.error("Error rejecting driver:", error);
    throw error;
  }
};

/**
 * Helper: Calculate distance between coordinates
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
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
