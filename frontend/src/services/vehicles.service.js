import { isSupabaseConfigured, supabase } from "../config/supabase";
import { demoVehicles } from "../data/demoVehicles";
import { calculateHaversineDistance } from "../utils/distance";

const cloneDemoVehicles = () => demoVehicles.map((vehicle) => ({ ...vehicle }));

export const mapVehicleRecord = (row) => {
  if (!row) {
    return null;
  }

  return {
    ...row,
    ownerId: row.owner_id,
    listingType: row.listing_type,
    pricePerHour: row.price_per_hour,
    pricePerDay: row.price_per_day,
    salePrice: row.sale_price,
    driverAvailable: row.driver_available,
    driverFeePerDay: row.driver_fee_per_day,
    isAvailable: row.is_available,
    bookedDates: row.booked_dates || [],
    horsePower: row.hp,
    fuelType: row.fuel_type,
    reviewCount: row.review_count,
    isVerified: row.is_verified,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    ownerPhone: row.owner?.phone || row.owner_phone || null,
    ownerName: row.owner?.display_name || row.owner_name || null,
    location: {
      lat: row.location_lat,
      lng: row.location_lng,
      address: row.location_address,
      state: row.location_state,
      district: row.location_district,
    },
  };
};

const toVehiclePayload = (vehicleData = {}) => ({
  owner_id: vehicleData.owner_id || vehicleData.ownerId,
  listing_type: vehicleData.listing_type || vehicleData.listingType,
  name: vehicleData.name,
  type: String(vehicleData.type || "").toLowerCase() || null,
  brand: vehicleData.brand || null,
  model: vehicleData.model || null,
  year: vehicleData.year || null,
  description: vehicleData.description || null,
  images: vehicleData.images || [],
  location_lat: vehicleData.location_lat ?? vehicleData.location?.lat ?? null,
  location_lng: vehicleData.location_lng ?? vehicleData.location?.lng ?? null,
  location_address: vehicleData.location_address ?? vehicleData.location?.address ?? null,
  location_state: vehicleData.location_state ?? vehicleData.location?.state ?? null,
  location_district: vehicleData.location_district ?? vehicleData.location?.district ?? null,
  price_per_hour: vehicleData.price_per_hour ?? vehicleData.pricePerHour ?? null,
  price_per_day: vehicleData.price_per_day ?? vehicleData.pricePerDay ?? null,
  sale_price: vehicleData.sale_price ?? vehicleData.salePrice ?? null,
  driver_available: vehicleData.driver_available ?? vehicleData.driverAvailable ?? false,
  driver_fee_per_day: vehicleData.driver_fee_per_day ?? vehicleData.driverFeePerDay ?? 0,
  is_available: vehicleData.is_available ?? vehicleData.isAvailable ?? true,
  booked_dates: vehicleData.booked_dates ?? vehicleData.bookedDates ?? [],
  hp: vehicleData.hp ?? vehicleData.horsePower ?? null,
  weight: vehicleData.weight || null,
  fuel_type: vehicleData.fuel_type ?? vehicleData.fuelType ?? null,
  capacity: vehicleData.capacity || null,
  rating: vehicleData.rating ?? 0,
  review_count: vehicleData.review_count ?? vehicleData.reviewCount ?? 0,
  is_verified: vehicleData.is_verified ?? vehicleData.isVerified ?? false,
  status: vehicleData.status || "active",
  updated_at: new Date().toISOString(),
});

const matchesListingType = (vehicle, listingType) =>
  !listingType || vehicle.listingType === listingType || vehicle.listingType === "both";

const filterLocally = (source, filters = {}) => {
  let results = [...source];

  if (filters.listingType) {
    results = results.filter((vehicle) => matchesListingType(vehicle, filters.listingType));
  }

  if (filters.type) {
    results = results.filter((vehicle) => String(vehicle.type || "").toLowerCase() === String(filters.type).toLowerCase());
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

  if (filters.query || filters.searchQuery) {
    const queryText = String(filters.query || filters.searchQuery).toLowerCase();
    results = results.filter((vehicle) =>
      [vehicle.name, vehicle.brand, vehicle.type, vehicle.description, vehicle.location?.address].some((value) =>
        String(value || "").toLowerCase().includes(queryText)
      )
    );
  }

  if (filters.location?.lat != null && filters.location?.lng != null && filters.radius) {
    results = results.filter((vehicle) => {
      if (vehicle.location?.lat == null || vehicle.location?.lng == null) {
        return false;
      }
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

const getFallbackVehicles = (filters = {}) => filterLocally(cloneDemoVehicles(), filters);

export async function getVehicles(filters = {}) {
  if (!isSupabaseConfigured) {
    return getFallbackVehicles(filters);
  }

  let query = supabase.from("vehicles").select("*, owner:users(id, display_name, phone)").eq("status", "active");

  if (filters.type) query = query.eq("type", String(filters.type).toLowerCase());
  if (filters.listingType && filters.listingType !== "all") query = query.eq("listing_type", filters.listingType);
  if (filters.isAvailable) query = query.eq("is_available", true);
  if (filters.minPrice) query = query.gte("price_per_day", filters.minPrice);
  if (filters.maxPrice) query = query.lte("price_per_day", filters.maxPrice);
  if (filters.driverAvailable) query = query.eq("driver_available", true);
  if (filters.ownerId) query = query.eq("owner_id", filters.ownerId);
  if (filters.limit) query = query.limit(filters.limit);

  query = query.order("created_at", { ascending: false });

  const { data, error } = await query;
  if (error) {
    console.error("Error fetching vehicles:", error);
    return getFallbackVehicles(filters);
  }

  return filterLocally((data || []).map(mapVehicleRecord), filters);
}

export async function getVehicleById(id) {
  if (!isSupabaseConfigured) {
    return cloneDemoVehicles().find((vehicle) => vehicle.id === id) || null;
  }

  const { data, error } = await supabase
    .from("vehicles")
    .select("*, owner:users(id, display_name, phone, email)")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Error fetching vehicle:", error);
    const fallback = cloneDemoVehicles().find((vehicle) => vehicle.id === id);
    if (fallback) {
      return fallback;
    }
    throw error;
  }

  return data ? mapVehicleRecord(data) : null;
}

export async function createVehicle(vehicleData) {
  if (!isSupabaseConfigured) {
    throw new Error("Configure Supabase to create vehicles.");
  }

  const { data, error } = await supabase.from("vehicles").insert(toVehiclePayload(vehicleData)).select().single();
  if (error) throw error;
  return mapVehicleRecord(data);
}

export async function updateVehicle(id, updates) {
  if (!isSupabaseConfigured) {
    throw new Error("Configure Supabase to update vehicles.");
  }

  const { data, error } = await supabase
    .from("vehicles")
    .update(toVehiclePayload(updates))
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return mapVehicleRecord(data);
}

export async function deleteVehicle(id) {
  if (!isSupabaseConfigured) {
    throw new Error("Configure Supabase to delete vehicles.");
  }

  const { error } = await supabase.from("vehicles").delete().eq("id", id);
  if (error) throw error;
}

export async function searchVehicles(queryText, filters = {}) {
  if (!queryText) {
    return getVehicles(filters);
  }

  if (!isSupabaseConfigured) {
    return getFallbackVehicles({ ...filters, query: queryText });
  }

  let query = supabase
    .from("vehicles")
    .select("*, owner:users(id, display_name, phone)")
    .eq("status", "active")
    .or(
      `name.ilike.%${queryText}%,brand.ilike.%${queryText}%,description.ilike.%${queryText}%,location_address.ilike.%${queryText}%`
    );

  if (filters.type) query = query.eq("type", String(filters.type).toLowerCase());
  if (filters.listingType) query = query.eq("listing_type", filters.listingType);

  const { data, error } = await query;
  if (error) {
    console.error("Error searching vehicles:", error);
    return getFallbackVehicles({ ...filters, query: queryText });
  }

  return filterLocally((data || []).map(mapVehicleRecord), { ...filters, query: queryText });
}

export async function getVehiclesForRent() {
  return getVehicles({ listingType: "rent" });
}

export async function getVehiclesForSale() {
  return getVehicles({ listingType: "sale" });
}

export async function filterVehicles(filters) {
  return getVehicles(filters);
}

export async function getVehiclesByOwner(ownerId) {
  return getVehicles({ ownerId });
}

export { toVehiclePayload };
