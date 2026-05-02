import { isSupabaseConfigured, supabase } from "../config/supabase";
import { demoVehicles } from "../data/demoVehicles";
import { calculateHaversineDistance } from "../utils/distance";

const cloneDemoVehicles = () => demoVehicles.map((vehicle) => ({ ...vehicle }));

const createVehiclePlaceholderImage = (name, type) => {
  const palette = {
    tractor: "#16a34a",
    harvester: "#0f766e",
    jcb: "#f59e0b",
    loader: "#7c3aed",
    excavator: "#ea580c",
    bulldozer: "#dc2626",
    crane: "#2563eb",
  };

  const accent = palette[String(type || "").toLowerCase()] || "#4f46e5";
  const label = String(type || "Equipment")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
      <rect width="1200" height="800" fill="#f3f4f6" />
      <rect x="70" y="70" width="1060" height="660" rx="36" fill="${accent}" opacity="0.12" />
      <rect x="120" y="540" width="960" height="90" rx="24" fill="${accent}" opacity="0.18" />
      <circle cx="340" cy="610" r="72" fill="#1f2937" />
      <circle cx="860" cy="610" r="72" fill="#1f2937" />
      <circle cx="340" cy="610" r="32" fill="#9ca3af" />
      <circle cx="860" cy="610" r="32" fill="#9ca3af" />
      <rect x="250" y="380" width="520" height="120" rx="28" fill="${accent}" opacity="0.88" />
      <rect x="720" y="330" width="140" height="170" rx="20" fill="${accent}" opacity="0.7" />
      <rect x="760" y="250" width="28" height="130" rx="12" fill="#374151" />
      <text x="120" y="185" font-family="Arial, sans-serif" font-size="54" font-weight="700" fill="#111827">${name}</text>
      <text x="120" y="255" font-family="Arial, sans-serif" font-size="30" fill="#374151">${label}</text>
      <text x="120" y="690" font-family="Arial, sans-serif" font-size="28" fill="#4b5563">HeavyHub vehicle preview</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const sanitizeVehicleImages = (images, fallbackName, fallbackType) => {
  const imageList = Array.isArray(images) ? images.filter(Boolean) : [];

  if (imageList.length === 0) {
    return [createVehiclePlaceholderImage(fallbackName, fallbackType)];
  }

  return imageList.map((image) => {
    if (typeof image !== "string") {
      return createVehiclePlaceholderImage(fallbackName, fallbackType);
    }

    const normalized = image.toLowerCase();
    const looksRandomSeedImage =
      normalized.includes("images.unsplash.com") || normalized.includes("source.unsplash.com");

    return looksRandomSeedImage ? createVehiclePlaceholderImage(fallbackName, fallbackType) : image;
  });
};

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
    images: sanitizeVehicleImages(row.images, row.name, row.type),
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
    images: sanitizeVehicleImages(vehicleData.images, vehicleData.name, vehicleData.type),
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

const matchesType = (vehicle, type) => {
  if (!type) {
    return true;
  }

  const normalizedVehicleType = String(vehicle.type || "").toLowerCase();
  const normalizedFilterType = String(type).toLowerCase();

  if (normalizedFilterType === "jcb") {
    return normalizedVehicleType === "jcb" || normalizedVehicleType === "loader";
  }

  return normalizedVehicleType === normalizedFilterType;
};

const filterLocally = (source, filters = {}) => {
  let results = [...source];

  if (filters.listingType) {
    results = results.filter((vehicle) => matchesListingType(vehicle, filters.listingType));
  }

  if (filters.type) {
    results = results.filter((vehicle) => matchesType(vehicle, filters.type));
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

  if (filters.type && String(filters.type).toLowerCase() !== "jcb") {
    query = query.eq("type", String(filters.type).toLowerCase());
  }
  if (filters.isAvailable) query = query.eq("is_available", true);
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

  if (filters.type && String(filters.type).toLowerCase() !== "jcb") {
    query = query.eq("type", String(filters.type).toLowerCase());
  }

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
