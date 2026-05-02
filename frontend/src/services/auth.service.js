import { isSupabaseConfigured, supabase } from "../config/supabase";

function requireSupabase() {
  if (!isSupabaseConfigured) {
    throw new Error("Configure Supabase in frontend/.env to enable authentication.");
  }
}

export async function signInWithGoogle() {
  requireSupabase();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: { access_type: "offline", prompt: "consent" },
    },
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function signOut() {
  if (!isSupabaseConfigured) {
    return;
  }

  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
}

export async function getCurrentUser() {
  if (!isSupabaseConfigured) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getUserProfile(userId) {
  if (!isSupabaseConfigured || !userId) {
    return null;
  }

  const { data, error } = await supabase.from("users").select("*").eq("id", userId).maybeSingle();
  if (error && error.code !== "PGRST116") {
    throw error;
  }

  return data;
}

export async function createUserProfile(user) {
  requireSupabase();
  const payload = {
    id: user.id,
    email: user.email,
    display_name: user.user_metadata?.full_name || user.email,
    photo_url: user.user_metadata?.avatar_url || "",
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("users")
    .upsert(payload, { onConflict: "id" })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateUserRole(userId, role) {
  requireSupabase();
  const { data, error } = await supabase
    .from("users")
    .update({
      role,
      active_role: role,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateUserRoles(userId, roles) {
  requireSupabase();
  const primaryRole = roles[0] || null;
  const { data, error } = await supabase
    .from("users")
    .update({
      roles,
      role: primaryRole,
      active_role: primaryRole,
      has_multiple_roles: roles.length > 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function switchActiveRole(userId, role) {
  requireSupabase();
  const { data, error } = await supabase
    .from("users")
    .update({ active_role: role, updated_at: new Date().toISOString() })
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export const signOutUser = signOut;
