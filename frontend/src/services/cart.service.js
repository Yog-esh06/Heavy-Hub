import { isSupabaseConfigured, supabase } from "../config/supabase";

const mapCartItem = (row) => {
  if (!row) return null;
  return {
    ...row,
    userId: row.user_id,
    vehicleId: row.vehicle_id,
    vehicleName: row.vehicle_name,
    vehicleImage: row.vehicle_image,
    pricePerDay: row.price_per_day,
    driverRequested: row.driver_requested,
    driverFeePerDay: row.driver_fee_per_day,
    startDate: row.start_date,
    endDate: row.end_date,
    startTime: row.start_time,
    totalDays: row.total_days,
    totalAmount: row.total_amount,
    addedAt: row.added_at,
  };
};

export async function getCart(userId) {
  if (!isSupabaseConfigured || !userId) {
    return [];
  }

  const { data, error } = await supabase
    .from("cart")
    .select("*, vehicle:vehicles(id, name, images, is_available, booked_dates)")
    .eq("user_id", userId)
    .order("added_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(mapCartItem);
}

export async function addToCart(userId, item) {
  if (!isSupabaseConfigured) {
    throw new Error("Configure Supabase to use the cart.");
  }

  const payload = {
    user_id: userId,
    vehicle_id: item.vehicleId,
    vehicle_name: item.vehicleName || item.name || "",
    vehicle_image: item.vehicleImage || item.image || "",
    price_per_day: item.pricePerDay || 0,
    driver_requested: item.driverRequested || false,
    driver_fee_per_day: item.driverFeePerDay || 0,
    start_date: item.startDate || null,
    end_date: item.endDate || null,
    start_time: item.startTime || null,
    total_days: item.totalDays || 1,
    total_amount: item.totalAmount || 0,
  };

  const { data, error } = await supabase.from("cart").insert(payload).select().single();
  if (error) throw error;
  return mapCartItem(data);
}

export async function updateCartItem(itemId, updates) {
  if (!isSupabaseConfigured) {
    throw new Error("Configure Supabase to use the cart.");
  }

  const payload = {
    ...(updates.vehicleName ? { vehicle_name: updates.vehicleName } : {}),
    ...(updates.vehicleImage ? { vehicle_image: updates.vehicleImage } : {}),
    ...(updates.pricePerDay != null ? { price_per_day: updates.pricePerDay } : {}),
    ...(updates.driverRequested != null ? { driver_requested: updates.driverRequested } : {}),
    ...(updates.driverFeePerDay != null ? { driver_fee_per_day: updates.driverFeePerDay } : {}),
    ...(updates.startDate !== undefined ? { start_date: updates.startDate || null } : {}),
    ...(updates.endDate !== undefined ? { end_date: updates.endDate || null } : {}),
    ...(updates.startTime !== undefined ? { start_time: updates.startTime || null } : {}),
    ...(updates.totalDays != null ? { total_days: updates.totalDays } : {}),
    ...(updates.totalAmount != null ? { total_amount: updates.totalAmount } : {}),
  };

  const { data, error } = await supabase.from("cart").update(payload).eq("id", itemId).select().single();
  if (error) throw error;
  return mapCartItem(data);
}

export async function removeFromCart(itemId) {
  if (!isSupabaseConfigured) {
    return;
  }

  const { error } = await supabase.from("cart").delete().eq("id", itemId);
  if (error) throw error;
}

export async function clearCart(userId) {
  if (!isSupabaseConfigured || !userId) {
    return;
  }

  const { error } = await supabase.from("cart").delete().eq("user_id", userId);
  if (error) throw error;
}

export const getCartItems = getCart;
export const addCartItem = addToCart;
export const removeCartItem = removeFromCart;
export const clearCartItems = clearCart;
