import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { isSupabaseConfigured, supabase } from "../config/supabase";
import {
  createUserProfile,
  getUserProfile,
  signInWithGoogle as signInWithGoogleService,
  signOut as signOutService,
  switchActiveRole as switchActiveRoleService,
  updateUserRoles as updateUserRolesService,
} from "../services/auth.service";

const AuthContext = createContext(null);

const normalizeProfile = (profile) => {
  if (!profile) {
    return null;
  }

  return {
    ...profile,
    displayName: profile.display_name,
    photoURL: profile.photo_url,
    activeRole: profile.active_role,
    hasMultipleRoles: profile.has_multiple_roles,
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
    location:
      profile.location_lat != null || profile.location_lng != null || profile.location_address
        ? {
            lat: profile.location_lat,
            lng: profile.location_lng,
            address: profile.location_address,
          }
        : null,
  };
};

const normalizeUser = (authUser, profile) => {
  if (!authUser) {
    return null;
  }

  return {
    ...authUser,
    uid: authUser.id,
    displayName: profile?.displayName || authUser.user_metadata?.full_name || authUser.email,
    photoURL: profile?.photoURL || authUser.user_metadata?.avatar_url || "",
  };
};

export function AuthProvider({ children }) {
  const [authUser, setAuthUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return undefined;
    }

    let active = true;

    const loadProfile = async (user) => {
      try {
        let nextProfile = await getUserProfile(user.id);
        if (!nextProfile) {
          nextProfile = await createUserProfile(user);
        }

        if (!active) {
          return;
        }

        setAuthUser(user);
        setProfile(normalizeProfile(nextProfile));
        setError(null);
      } catch (err) {
        if (!active) {
          return;
        }
        console.error("Profile load error:", err);
        setError(err.message);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!active) {
        return;
      }

      if (session?.user) {
        await loadProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!active) {
        return;
      }

      if (event === "SIGNED_IN" && session?.user) {
        setLoading(true);
        await loadProfile(session.user);
      } else if (event === "SIGNED_OUT") {
        setAuthUser(null);
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const user = useMemo(() => normalizeUser(authUser, profile), [authUser, profile]);
  const roles = profile?.roles || [];
  const activeRole = profile?.activeRole || null;

  const value = {
    user,
    profile,
    userProfile: profile,
    role: activeRole,
    activeRole,
    roles,
    loading,
    error,
    isAuthenticated: Boolean(user),
    isConfigured: isSupabaseConfigured,
    signInWithGoogle: signInWithGoogleService,
    signOutUser: signOutService,
    updateRoles: async (nextRoles) => {
      if (!user?.id) {
        throw new Error("You must be signed in to update roles.");
      }
      const updated = await updateUserRolesService(user.id, nextRoles);
      setProfile(normalizeProfile(updated));
      return updated;
    },
    switchRole: async (nextRole) => {
      if (!user?.id) {
        throw new Error("You must be signed in to switch roles.");
      }
      const updated = await switchActiveRoleService(user.id, nextRole);
      setProfile(normalizeProfile(updated));
      return updated;
    },
    setProfile: (updater) => {
      setProfile((current) => {
        const nextValue = typeof updater === "function" ? updater(current) : updater;
        return nextValue;
      });
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}
