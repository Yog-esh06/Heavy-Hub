import { isSupabaseConfigured, supabase } from "../config/supabase";

const mapUserRecord = (row) => {
  if (!row) return null;
  return {
    ...row,
    uid: row.id,
    displayName: row.display_name,
    photoURL: row.photo_url,
    activeRole: row.active_role,
    hasMultipleRoles: row.has_multiple_roles,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
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

export async function getAllUsers() {
  if (!isSupabaseConfigured) {
    return [];
  }

  const { data, error } = await supabase.from("users").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(mapUserRecord);
}

export async function updateUserProfile(userId, updates) {
  if (!isSupabaseConfigured) {
    throw new Error("Configure Supabase to update user profiles.");
  }

  const payload = {
    ...(updates.displayName !== undefined ? { display_name: updates.displayName } : {}),
    ...(updates.photoURL !== undefined ? { photo_url: updates.photoURL } : {}),
    ...(updates.phone !== undefined ? { phone: updates.phone } : {}),
    ...(updates.role !== undefined ? { role: updates.role } : {}),
    ...(updates.activeRole !== undefined ? { active_role: updates.activeRole } : {}),
    ...(updates.roles !== undefined ? { roles: updates.roles } : {}),
    ...(updates.location?.lat !== undefined ? { location_lat: updates.location.lat } : {}),
    ...(updates.location?.lng !== undefined ? { location_lng: updates.location.lng } : {}),
    ...(updates.location?.address !== undefined ? { location_address: updates.location.address } : {}),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase.from("users").update(payload).eq("id", userId).select().single();
  if (error) throw error;
  return mapUserRecord(data);
}

export async function getUserById(userId) {
  if (!isSupabaseConfigured || !userId) {
    return null;
  }

  const { data, error } = await supabase.from("users").select("*").eq("id", userId).single();
  if (error) throw error;
  return mapUserRecord(data);
}

export async function deleteUser(userId) {
  if (!isSupabaseConfigured) {
    throw new Error("Configure Supabase to manage users.");
  }
  const { error } = await supabase.from("users").delete().eq("id", userId);
  if (error) throw error;
}
