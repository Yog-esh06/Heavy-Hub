import { isSupabaseConfigured, supabase } from "../config/supabase";
import { createDemoOwnerListings } from "../data/demoProfiles";
import { createVehicle, deleteVehicle, getVehicleById, mapVehicleRecord, toVehiclePayload, updateVehicle } from "./vehicles.service";

export async function getOwnerListings(ownerId) {
  if (!isSupabaseConfigured) {
    return createDemoOwnerListings(ownerId);
  }

  const { data, error } = await supabase
    .from("vehicles")
    .select("*")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  const listings = (data || []).map(mapVehicleRecord);
  return listings.length > 0 ? listings : createDemoOwnerListings(ownerId);
}

export async function createListing(listingData) {
  return createVehicle(listingData);
}

export async function updateListing(id, updates) {
  return updateVehicle(id, updates);
}

export async function deleteListing(id) {
  if (!isSupabaseConfigured) {
    throw new Error("Configure Supabase to delete listings.");
  }

  const { data: active } = await supabase
    .from("bookings")
    .select("id")
    .eq("vehicle_id", id)
    .in("status", ["pending", "confirmed", "active"])
    .limit(1);

  if (active?.length > 0) {
    throw new Error("Cannot delete listing with active bookings");
  }

  await deleteVehicle(id);
}

export async function toggleListingAvailability(id, isAvailable) {
  return updateVehicle(id, { isAvailable });
}

export async function getListingById(id) {
  return getVehicleById(id);
}

export async function blockListingDates(id, dates) {
  const current = await getVehicleById(id);
  const bookedDates = [...new Set([...(current?.bookedDates || []), ...dates])];
  return updateVehicle(id, { bookedDates });
}

export async function unblockListingDates(id, dates) {
  const current = await getVehicleById(id);
  const bookedDates = (current?.bookedDates || []).filter((date) => !dates.includes(date));
  return updateVehicle(id, { bookedDates });
}

export async function getListingStats(ownerId) {
  const listings = await getOwnerListings(ownerId);
  return {
    totalListings: listings.length,
    activeListings: listings.filter((listing) => listing.status === "active").length,
    soldListings: listings.filter((listing) => listing.status === "sold").length,
    totalRevenue: 0,
    avgRating:
      listings.reduce((sum, listing) => sum + Number(listing.rating || 0), 0) / listings.length || 0,
  };
}
export { getVehicleById };
