import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../config/firebase";
import { demoVehicles } from "../data/demoVehicles";
import { calculateHaversineDistance } from "../utils/distance";

const cloneDemoVehicles = () => demoVehicles.map((vehicle) => ({ ...vehicle }));

const matchesListingType = (vehicle, listingType) =>
  !listingType || vehicle.listingType === listingType || vehicle.listingType === "both";

const filterLocally = (source, filters = {}) => {
  let results = [...source];

  if (filters.listingType) {
    results = results.filter((vehicle) => matchesListingType(vehicle, filters.listingType));
  }

  if (filters.type) {
    results = results.filter((vehicle) => vehicle.type === filters.type);
  }

  if (filters.minPrice != null || filters.maxPrice != null) {
    results = results.filter((vehicle) => {
      const price = vehicle.pricePerDay || vehicle.salePrice || 0;
      const minOk = filters.minPrice == null || price >= filters.minPrice;
      const maxOk = filters.maxPrice == null || price <= filters.maxPrice;
      return minOk && maxOk;
    });
  }

  if (filters.driverAvailable) {
    results = results.filter((vehicle) => vehicle.driverAvailable);
  }

  if (filters.state) {
    results = results.filter((vehicle) => vehicle.location?.state === filters.state);
  }

  if (filters.searchQuery) {
    const queryText = filters.searchQuery.toLowerCase();
    results = results.filter((vehicle) =>
      [vehicle.name, vehicle.brand, vehicle.type].some((value) =>
        String(value || "").toLowerCase().includes(queryText)
      )
    );
  }

  if (filters.location?.lat != null && filters.location?.lng != null && filters.radius) {
    results = results.filter((vehicle) => {
      if (vehicle.location?.lat == null || vehicle.location?.lng == null) return false;
      return (
        calculateHaversineDistance(
          filters.location.lat,
          filters.location.lng,
          vehicle.location.lat,
          vehicle.location.lng
        ) <= filters.radius
      );
    });
  }

  return results;
};

export const getVehiclesForRent = async () => {
  try {
    const q = query(
      collection(db, "vehicles"),
      where("status", "==", "active"),
      where("listingType", "in", ["rent", "both"])
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
  } catch (error) {
    console.error("Error fetching rent vehicles:", error);
    return filterLocally(cloneDemoVehicles(), { listingType: "rent" });
  }
};

export const getVehiclesForSale = async () => {
  try {
    const q = query(
      collection(db, "vehicles"),
      where("status", "==", "active"),
      where("listingType", "in", ["sale", "both"])
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
  } catch (error) {
    console.error("Error fetching sale vehicles:", error);
    return filterLocally(cloneDemoVehicles(), { listingType: "sale" });
  }
};

export const getVehicleById = async (vehicleId) => {
  try {
    const vehicleRef = doc(db, "vehicles", vehicleId);
    const vehicleSnap = await getDoc(vehicleRef);

    if (!vehicleSnap.exists()) {
      const demoVehicle = cloneDemoVehicles().find((vehicle) => vehicle.id === vehicleId);
      if (demoVehicle) return demoVehicle;
      throw new Error("Vehicle not found");
    }

    return { id: vehicleSnap.id, ...vehicleSnap.data() };
  } catch (error) {
    console.error("Error fetching vehicle:", error);
    const demoVehicle = cloneDemoVehicles().find((vehicle) => vehicle.id === vehicleId);
    if (demoVehicle) return demoVehicle;
    throw error;
  }
};

export const filterVehicles = async (filters) => {
  try {
    const q = query(collection(db, "vehicles"), where("status", "==", "active"));
    const snapshot = await getDocs(q);
    const vehicles = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
    return filterLocally(vehicles, filters);
  } catch (error) {
    console.error("Error filtering vehicles:", error);
    return filterLocally(cloneDemoVehicles(), filters);
  }
};

export const getVehiclesByOwner = async (ownerId) => {
  try {
    const q = query(collection(db, "vehicles"), where("ownerId", "==", ownerId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
  } catch (error) {
    console.error("Error fetching owner vehicles:", error);
    return cloneDemoVehicles().filter((vehicle) => vehicle.ownerId === ownerId);
  }
};

export const searchVehicles = async (searchTerm) => {
  return filterLocally(cloneDemoVehicles(), { searchQuery: searchTerm });
};
