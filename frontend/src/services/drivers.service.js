import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { calculateHaversineDistance } from "../utils/distance";

export const assignNearestDriver = async (pickupLocation, vehicleType, startDate) => {
  try {
    const pickupLat = pickupLocation?.lat;
    const pickupLng = pickupLocation?.lng;

    if (pickupLat == null || pickupLng == null) {
      return { success: false, driverId: null, driver: null };
    }

    const driversRef = collection(db, "drivers");
    const driversQuery = query(
      driversRef,
      where("isAvailable", "==", true),
      where("applicationStatus", "==", "approved")
    );

    const snapshot = await getDocs(driversQuery);
    const drivers = snapshot.docs.map((snapshotDoc) => ({ id: snapshotDoc.id, ...snapshotDoc.data() }));

    const withDistance = drivers
      .filter((driver) => driver.location?.lat != null && driver.location?.lng != null)
      .filter((driver) => {
        if (!vehicleType) {
          return true;
        }
        return Array.isArray(driver.vehicleTypes)
          ? driver.vehicleTypes.includes(String(vehicleType).toLowerCase())
          : true;
      })
      .map((driver) => ({
        ...driver,
        distance: calculateHaversineDistance(
          pickupLat,
          pickupLng,
          driver.location.lat,
          driver.location.lng
        ),
      }))
      .filter((driver) => driver.distance <= 50)
      .sort((a, b) => a.distance - b.distance);

    if (withDistance.length === 0) {
      return { success: false, driverId: null, driver: null, startDate };
    }

    const nearest = withDistance[0];

    await updateDoc(doc(db, "drivers", nearest.id), {
      isAvailable: false,
      updatedAt: new Date(),
    });

    return {
      success: true,
      driverId: nearest.id,
      driver: nearest,
      startDate,
    };
  } catch (error) {
    console.error("Error assigning driver:", error);
    throw error;
  }
};

export const applyAsDriver = async (driverData) => {
  try {
    const driversRef = collection(db, "drivers");
    const driverId = driverData.uid || driverData.userId;
    const driverDocRef = doc(driversRef, driverId);

    await setDoc(driverDocRef, {
      ...driverData,
      uid: driverId,
      applicationStatus: "pending",
      isAvailable: true,
      currentJobId: null,
      rating: 0,
      reviewCount: 0,
      totalJobsCompleted: 0,
      location: driverData.location || driverData.currentLocation || null,
      createdAt: new Date(),
    });

    return { id: driverDocRef.id, ...driverData, uid: driverId };
  } catch (error) {
    console.error("Error applying as driver:", error);
    throw error;
  }
};

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

export const getNearbyDrivers = async (location, radiusKm = 50) => {
  try {
    const q = query(
      collection(db, "drivers"),
      where("applicationStatus", "==", "approved"),
      where("isAvailable", "==", true)
    );

    const snapshot = await getDocs(q);
    const drivers = snapshot.docs.map((snapshotDoc) => ({ id: snapshotDoc.id, ...snapshotDoc.data() }));

    return drivers.filter((driver) => {
      if (!driver.location || driver.location.lat === null) {
        return false;
      }

      const distance = calculateHaversineDistance(
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

export const getDriverApplicationStatus = async (userId) => {
  try {
    const driverRef = doc(db, "drivers", userId);
    const driverSnap = await getDoc(driverRef);

    if (!driverSnap.exists()) {
      return null;
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

export const updateDriverAvailability = async (driverId, isAvailable) => {
  try {
    const driverRef = doc(db, "drivers", driverId);
    await updateDoc(driverRef, {
      isAvailable,
      updatedAt: new Date(),
    });

    return getDriverById(driverId);
  } catch (error) {
    console.error("Error updating driver availability:", error);
    throw error;
  }
};

export const updateDriverCurrentJob = async (driverId, bookingId) => {
  try {
    const driverRef = doc(db, "drivers", driverId);
    await updateDoc(driverRef, {
      currentJobId: bookingId,
      isAvailable: false,
      updatedAt: new Date(),
    });

    return getDriverById(driverId);
  } catch (error) {
    console.error("Error updating driver job:", error);
    throw error;
  }
};

export const getAllDrivers = async () => {
  try {
    const q = query(collection(db, "drivers"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((snapshotDoc) => ({ id: snapshotDoc.id, ...snapshotDoc.data() }));
  } catch (error) {
    console.error("Error fetching drivers:", error);
    throw error;
  }
};

export const getPendingDriverApplications = async () => {
  try {
    const q = query(collection(db, "drivers"), where("applicationStatus", "==", "pending"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((snapshotDoc) => ({ id: snapshotDoc.id, ...snapshotDoc.data() }));
  } catch (error) {
    console.error("Error fetching pending applications:", error);
    throw error;
  }
};

export const approveDriverApplication = async (driverId, userId) => {
  try {
    const driverRef = doc(db, "drivers", driverId);
    await updateDoc(driverRef, {
      applicationStatus: "approved",
      isVerified: true,
      updatedAt: new Date(),
    });

    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    const currentRoles = userSnap.data().roles || [];

    if (!currentRoles.includes("driver")) {
      await updateDoc(userRef, {
        roles: [...currentRoles, "driver"],
      });
    }

    return getDriverById(driverId);
  } catch (error) {
    console.error("Error approving driver:", error);
    throw error;
  }
};

export const rejectDriverApplication = async (driverId) => {
  try {
    const driverRef = doc(db, "drivers", driverId);
    await updateDoc(driverRef, {
      applicationStatus: "rejected",
      updatedAt: new Date(),
    });

    return getDriverById(driverId);
  } catch (error) {
    console.error("Error rejecting driver:", error);
    throw error;
  }
};
