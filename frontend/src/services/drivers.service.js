import { isSupabaseConfigured, supabase } from "../config/supabase";
import { calculateHaversineDistance } from "../utils/distance";

const mapDriverRecord = (row) => {
  if (!row) return null;
  return {
    ...row,
    userId: row.user_id,
    fullName: row.name,
    licenseNumber: row.license_number,
    licenseExpiry: row.license_expiry,
    yearsOfExperience: row.experience_years,
    vehicleTypes: row.vehicle_types || [],
    currentJobId: row.current_job_id,
    reviewCount: row.review_count,
    totalJobsCompleted: row.total_jobs,
    feePerDay: row.fee_per_day,
    isVerified: row.is_verified,
    photoURL: row.photo_url,
    licenseUrl: row.license_url,
    aadharUrl: row.aadhar_url,
    applicationStatus: row.application_status,
    currentLocation:
      row.location_lat != null || row.location_lng != null || row.location_address
        ? {
            lat: row.location_lat,
            lng: row.location_lng,
            address: row.location_address,
          }
        : null,
    location:
      row.location_lat != null || row.location_lng != null || row.location_address
        ? {
            lat: row.location_lat,
            lng: row.location_lng,
            address: row.location_address,
          }
        : null,
  };
};

export async function applyAsDriver(userOrDriverData, maybeDriverData) {
  if (!isSupabaseConfigured) {
    throw new Error("Configure Supabase to apply as a driver.");
  }

  const userId = typeof userOrDriverData === "string" ? userOrDriverData : userOrDriverData.userId || userOrDriverData.uid;
  const driverData = typeof userOrDriverData === "string" ? maybeDriverData || {} : userOrDriverData;
  const documents = driverData.documents || {};
  const location = driverData.currentLocation || driverData.location || {};

  const payload = {
    user_id: userId,
    name: driverData.fullName || driverData.name || "",
    phone: driverData.phone || "",
    license_number: driverData.licenseNumber || "",
    license_expiry: driverData.licenseExpiry || null,
    experience_years: driverData.yearsOfExperience || 0,
    vehicle_types: driverData.vehicleTypes || [],
    location_lat: location.lat ?? null,
    location_lng: location.lng ?? null,
    location_address: location.address ?? "",
    is_available: true,
    fee_per_day: driverData.feePerDay || 0,
    license_url: documents.licensePhoto || driverData.licenseUrl || null,
    aadhar_url: documents.aadharPhoto || driverData.aadharUrl || null,
    photo_url: documents.profilePhoto || driverData.photoURL || null,
    application_status: "pending",
  };

  const { data, error } = await supabase.from("drivers").upsert(payload, { onConflict: "user_id" }).select().single();
  if (error) throw error;
  return mapDriverRecord(data);
}

export async function getDriverProfile(userId) {
  if (!isSupabaseConfigured || !userId) {
    return null;
  }

  const { data, error } = await supabase.from("drivers").select("*").eq("user_id", userId).maybeSingle();
  if (error && error.code !== "PGRST116") throw error;
  return mapDriverRecord(data);
}

export async function getDriverById(driverId) {
  if (!isSupabaseConfigured || !driverId) {
    return null;
  }

  const { data, error } = await supabase
    .from("drivers")
    .select("*")
    .or(`id.eq.${driverId},user_id.eq.${driverId}`)
    .limit(1)
    .maybeSingle();
  if (error && error.code !== "PGRST116") throw error;
  return mapDriverRecord(data);
}

export async function updateDriverAvailability(userIdOrDriverId, isAvailable) {
  if (!isSupabaseConfigured) {
    throw new Error("Configure Supabase to update driver availability.");
  }

  const profile = await getDriverById(userIdOrDriverId);
  const { data, error } = await supabase
    .from("drivers")
    .update({ is_available: isAvailable })
    .eq("id", profile?.id || userIdOrDriverId)
    .select()
    .single();
  if (error) throw error;
  return mapDriverRecord(data);
}

export async function assignNearestDriver(pickupLat, pickupLng) {
  if (!isSupabaseConfigured) {
    return null;
  }

  const { data: drivers, error } = await supabase
    .from("drivers")
    .select("*")
    .eq("is_available", true)
    .eq("application_status", "approved");
  if (error) throw error;
  if (!drivers?.length) return null;

  const withDistance = drivers
    .map((driver) => ({
      ...driver,
      distance: calculateHaversineDistance(pickupLat, pickupLng, driver.location_lat, driver.location_lng),
    }))
    .filter((driver) => driver.distance <= 50)
    .sort((a, b) => a.distance - b.distance);

  if (!withDistance.length) return null;

  const nearest = withDistance[0];
  await supabase.from("drivers").update({ is_available: false }).eq("id", nearest.id);
  return mapDriverRecord(nearest);
}

export async function getApprovedDrivers() {
  if (!isSupabaseConfigured) {
    return [];
  }

  const { data, error } = await supabase.from("drivers").select("*").eq("application_status", "approved");
  if (error) throw error;
  return (data || []).map(mapDriverRecord);
}

export async function getNearbyDrivers(location, radiusKm = 50) {
  const drivers = await getApprovedDrivers();
  return drivers.filter((driver) => {
    if (driver.location?.lat == null || driver.location?.lng == null) {
      return false;
    }
    return (
      calculateHaversineDistance(location.lat, location.lng, driver.location.lat, driver.location.lng) <=
      radiusKm
    );
  });
}

export async function getDriverApplicationStatus(userId) {
  const profile = await getDriverProfile(userId);
  if (!profile) return null;
  return {
    id: profile.id,
    status: profile.applicationStatus,
    createdAt: profile.created_at,
  };
}

export async function updateDriverCurrentJob(userId, bookingId) {
  if (!isSupabaseConfigured) {
    throw new Error("Configure Supabase to update driver jobs.");
  }

  const { data, error } = await supabase
    .from("drivers")
    .update({ current_job_id: bookingId, is_available: false })
    .eq("user_id", userId)
    .select()
    .single();
  if (error) throw error;
  return mapDriverRecord(data);
}

export async function getAllDrivers() {
  if (!isSupabaseConfigured) {
    return [];
  }
  const { data, error } = await supabase.from("drivers").select("*");
  if (error) throw error;
  return (data || []).map(mapDriverRecord);
}

export async function getPendingDriverApplications() {
  if (!isSupabaseConfigured) {
    return [];
  }
  const { data, error } = await supabase.from("drivers").select("*").eq("application_status", "pending");
  if (error) throw error;
  return (data || []).map(mapDriverRecord);
}

export async function approveDriverApplication(driverId, userId) {
  if (!isSupabaseConfigured) {
    throw new Error("Configure Supabase to approve drivers.");
  }

  const { data, error } = await supabase
    .from("drivers")
    .update({ application_status: "approved", is_verified: true })
    .eq("id", driverId)
    .select()
    .single();
  if (error) throw error;

  const profile = await supabase.from("users").select("roles").eq("id", userId).single();
  const currentRoles = profile.data?.roles || [];
  const nextRoles = currentRoles.includes("driver") ? currentRoles : [...currentRoles, "driver"];
  await supabase
    .from("users")
    .update({ roles: nextRoles, has_multiple_roles: nextRoles.length > 1 })
    .eq("id", userId);

  return mapDriverRecord(data);
}

export async function rejectDriverApplication(driverId) {
  if (!isSupabaseConfigured) {
    throw new Error("Configure Supabase to reject drivers.");
  }

  const { data, error } = await supabase
    .from("drivers")
    .update({ application_status: "rejected" })
    .eq("id", driverId)
    .select()
    .single();
  if (error) throw error;
  return mapDriverRecord(data);
}
