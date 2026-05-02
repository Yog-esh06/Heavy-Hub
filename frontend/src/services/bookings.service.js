import { isSupabaseConfigured, supabase } from "../config/supabase";
import { createDemoBookings } from "../data/demoProfiles";
import { assignNearestDriver } from "./drivers.service";

function mapBookingRecord(row) {
  if (!row) {
    return null;
  }

  return {
    ...row,
    vehicleId: row.vehicle_id,
    vehicleName: row.vehicle_name,
    vehicleImage: row.vehicle_image,
    renterId: row.renter_id,
    renterName: row.renter_name,
    renterPhone: row.renter_phone,
    ownerId: row.owner_id,
    driverId: row.driver_id,
    driverRequested: row.driver_requested,
    startDate: row.start_date,
    endDate: row.end_date,
    startTime: row.start_time,
    endTime: row.end_time,
    pickupLat: row.pickup_lat,
    pickupLng: row.pickup_lng,
    pickupAddress: row.pickup_address,
    pickupLocation:
      row.pickup_lat != null || row.pickup_lng != null || row.pickup_address
        ? {
            lat: row.pickup_lat,
            lng: row.pickup_lng,
            address: row.pickup_address,
          }
        : null,
    totalDays: row.total_days,
    pricePerDay: row.price_per_day,
    driverFee: row.driver_fee,
    driverFeePerDay: row.driver_fee,
    totalAmount: row.total_amount,
    cancellationReason: row.cancellation_reason,
    refundAmount: row.refund_amount,
    paymentStatus: row.payment_status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    completedAt: row.completed_at || row.updated_at || null,
    vehicle: row.vehicle
      ? {
          ...row.vehicle,
          images: row.vehicle.images || [],
        }
      : null,
    driver: row.driver_profile
      ? {
          id: row.driver_profile.id,
          name: row.driver_profile.name,
          phone: row.driver_profile.phone,
          photoURL: row.driver_profile.photo_url,
        }
      : null,
  };
}

function generateDateRange(startDate, endDate) {
  const dates = [];
  const current = new Date(startDate);
  const end = new Date(endDate);
  while (current <= end) {
    dates.push(current.toISOString().split("T")[0]);
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

function ensureConfigured() {
  if (!isSupabaseConfigured) {
    throw new Error("Configure Supabase in frontend/.env to use bookings.");
  }
}

function resolveDemoPerspective(userId, filters = {}) {
  if (filters.ownerId === userId) return "owner";
  if (filters.driverId === userId) return "driver";
  return "renter";
}

function getDemoBookings(userId, filters = {}) {
  return createDemoBookings(userId, resolveDemoPerspective(userId, filters));
}

export async function createBooking(bookingData) {
  ensureConfigured();

  const { data: vehicle, error: vehicleError } = await supabase
    .from("vehicles")
    .select("*")
    .eq("id", bookingData.vehicleId)
    .single();

  if (vehicleError) throw vehicleError;
  if (!vehicle.is_available) throw new Error("Vehicle is not available");

  const totalDays =
    bookingData.totalDays ||
    Math.max(
      1,
      Math.ceil(
        (new Date(bookingData.endDate) - new Date(bookingData.startDate)) / (1000 * 60 * 60 * 24)
      )
    );
  const driverFee = bookingData.driverRequested ? Number(vehicle.driver_fee_per_day || 0) * totalDays : 0;
  const totalAmount = Number(vehicle.price_per_day || 0) * totalDays + driverFee;

  let driverId = null;
  if (bookingData.driverRequested && bookingData.pickupLat != null && bookingData.pickupLng != null) {
    const driver = await assignNearestDriver(
      bookingData.pickupLat,
      bookingData.pickupLng,
      bookingData.startDate
    );
    if (driver) {
      driverId = driver.user_id;
    }
  }

  const payload = {
    vehicle_id: bookingData.vehicleId,
    vehicle_name: vehicle.name,
    vehicle_image: vehicle.images?.[0] || "",
    renter_id: bookingData.renterId,
    renter_name: bookingData.renterName || "",
    renter_phone: bookingData.renterPhone || "",
    owner_id: vehicle.owner_id,
    driver_id: driverId,
    driver_requested: bookingData.driverRequested || false,
    start_date: bookingData.startDate,
    end_date: bookingData.endDate,
    start_time: bookingData.startTime || "08:00",
    end_time: bookingData.endTime || null,
    pickup_lat: bookingData.pickupLat ?? bookingData.pickupLocation?.lat ?? null,
    pickup_lng: bookingData.pickupLng ?? bookingData.pickupLocation?.lng ?? null,
    pickup_address: bookingData.pickupAddress ?? bookingData.pickupLocation?.address ?? null,
    total_days: totalDays,
    price_per_day: vehicle.price_per_day,
    driver_fee: driverFee,
    total_amount: totalAmount,
    status: "confirmed",
    notes: bookingData.notes || "",
  };

  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .insert(payload)
    .select()
    .single();

  if (bookingError) throw bookingError;

  const newDates = generateDateRange(bookingData.startDate, bookingData.endDate);
  await supabase
    .from("vehicles")
    .update({
      booked_dates: [...(vehicle.booked_dates || []), ...newDates],
      is_available: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", bookingData.vehicleId);

  await supabase.from("messages").insert({
    booking_id: booking.id,
    sender_id: bookingData.renterId,
    sender_name: "System",
    content: `Booking confirmed! ${vehicle.name} booked from ${bookingData.startDate} to ${bookingData.endDate}.${driverId ? " Driver has been assigned." : ""}`,
    message_type: "system",
  });

  return mapBookingRecord(booking);
}

export async function cancelBooking(bookingId, reason) {
  ensureConfigured();

  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", bookingId)
    .single();

  if (bookingError) throw bookingError;

  const hoursUntilStart = (new Date(booking.start_date) - new Date()) / (1000 * 60 * 60);
  let refundAmount = 0;
  if (hoursUntilStart > 48) refundAmount = Number(booking.total_amount || 0) * 0.9;
  else if (hoursUntilStart > 24) refundAmount = Number(booking.total_amount || 0) * 0.5;

  const { error } = await supabase
    .from("bookings")
    .update({
      status: "cancelled",
      cancellation_reason: reason,
      refund_amount: refundAmount,
      updated_at: new Date().toISOString(),
    })
    .eq("id", bookingId);

  if (error) throw error;

  const { data: vehicle } = await supabase.from("vehicles").select("booked_dates").eq("id", booking.vehicle_id).single();

  const cancelledDates = generateDateRange(booking.start_date, booking.end_date);
  const remaining = (vehicle?.booked_dates || []).filter((date) => !cancelledDates.includes(date));

  await supabase
    .from("vehicles")
    .update({
      booked_dates: remaining,
      is_available: remaining.length === 0,
      updated_at: new Date().toISOString(),
    })
    .eq("id", booking.vehicle_id);

  if (booking.driver_id) {
    await supabase
      .from("drivers")
      .update({ is_available: true, current_job_id: null })
      .eq("user_id", booking.driver_id);
  }

  return { refundAmount };
}

export async function getUserBookings(userId, filters = {}) {
  if (!userId) {
    return [];
  }

  if (!isSupabaseConfigured) {
    return getDemoBookings(userId, filters);
  }

  let query = supabase
    .from("bookings")
    .select("*, vehicle:vehicles(id, name, images, type), driver_profile:drivers(id, user_id, name, phone, photo_url)")
    .or(`renter_id.eq.${userId},owner_id.eq.${userId},driver_id.eq.${userId}`);

  if (filters.status) query = query.eq("status", filters.status);
  query = query.order("created_at", { ascending: false });

  const { data, error } = await query;
  if (error) throw error;
  const bookings = (data || []).map(mapBookingRecord);
  return bookings.length > 0 ? bookings : getDemoBookings(userId, filters);
}

export async function getUserBookingsAsRenter(userId) {
  const bookings = await getUserBookings(userId);
  return bookings.filter((booking) => booking.renterId === userId);
}

export async function getOwnerIncomingBookings(ownerId) {
  const bookings = await getUserBookings(ownerId);
  return bookings.filter((booking) => booking.ownerId === ownerId);
}

export async function getDriverBookings(driverId) {
  const bookings = await getUserBookings(driverId);
  return bookings.filter((booking) => booking.driverId === driverId);
}

export async function getBookingById(bookingId) {
  if (!isSupabaseConfigured) {
    const demoBookings = [
      ...createDemoBookings("demo-renter-profile", "renter"),
      ...createDemoBookings("demo-owner-profile", "owner"),
      ...createDemoBookings("demo-driver-profile", "driver"),
    ];
    return demoBookings.find((booking) => booking.id === bookingId) || null;
  }
  const { data, error } = await supabase
    .from("bookings")
    .select("*, vehicle:vehicles(id, name, images, type), driver_profile:drivers(id, user_id, name, phone, photo_url)")
    .eq("id", bookingId)
    .single();
  if (error) throw error;
  return mapBookingRecord(data);
}

export async function updateBookingStatus(bookingId, status) {
  ensureConfigured();

  const { data, error } = await supabase
    .from("bookings")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", bookingId)
    .select()
    .single();
  if (error) throw error;

  if (status === "completed" && data.driver_id) {
    await supabase
      .from("drivers")
      .update({ is_available: true, current_job_id: null })
      .eq("user_id", data.driver_id);
  }

  return mapBookingRecord(data);
}

export async function confirmBooking(bookingId) {
  return updateBookingStatus(bookingId, "confirmed");
}

export async function getCompletedBookings(userId, role = "renter") {
  const bookings = await getUserBookings(userId, { status: "completed" });
  if (role === "owner") return bookings.filter((booking) => booking.ownerId === userId);
  if (role === "driver") return bookings.filter((booking) => booking.driverId === userId);
  return bookings.filter((booking) => booking.renterId === userId);
}

export async function submitReview(reviewData) {
  ensureConfigured();
  const { data, error } = await supabase.from("reviews").insert(reviewData).select().single();
  if (error) throw error;

  const { data: reviews } = await supabase.from("reviews").select("rating").eq("vehicle_id", reviewData.vehicle_id);
  if (reviews?.length) {
    const avg = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
    await supabase
      .from("vehicles")
      .update({ rating: Math.round(avg * 10) / 10, review_count: reviews.length })
      .eq("id", reviewData.vehicle_id);
  }

  return data;
}

export async function getVehicleReviews(vehicleId) {
  ensureConfigured();
  const { data, error } = await supabase
    .from("reviews")
    .select("*, reviewer:users(display_name, photo_url)")
    .eq("vehicle_id", vehicleId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}
