import React, { createContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth";
import { auth, db } from "../config/firebase";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [roles, setRoles] = useState([]);
  const [activeRole, setActiveRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      try {
        if (authUser) {
          setUser(authUser);

          // Fetch user profile from Firestore
          const userRef = doc(db, "users", authUser.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const profileData = userSnap.data();
            setUserProfile(profileData);
            setRoles(profileData.roles || []);
            setActiveRole(profileData.activeRole);
          } else {
            const newProfile = {
              uid: authUser.uid,
              email: authUser.email,
              displayName: authUser.displayName || "User",
              photoURL: authUser.photoURL || "",
              phone: "",
              roles: [],
              role: null,
              activeRole: null,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            };

            await setDoc(userRef, newProfile, { merge: true });
            setUserProfile(newProfile);
            setRoles([]);
            setActiveRole(null);
          }
        } else {
          setUser(null);
          setUserProfile(null);
          setRoles([]);
          setActiveRole(null);
        }
        setError(null);
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  // Google Sign-In
  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      provider.addScope("profile");
      provider.addScope("email");

      const result = await signInWithPopup(auth, provider);
      const userRef = doc(db, "users", result.user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName || "User",
          photoURL: result.user.photoURL || "",
          phone: "",
          roles: [],
          role: null,
          activeRole: null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      return result.user;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Sign Out
  const signOutUser = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
      setRoles([]);
      setActiveRole(null);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update user roles
  const updateRoles = async (newRoles) => {
    if (!user) return;

    try {
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, { roles: newRoles }, { merge: true });
      setRoles(newRoles);

      // Set first role as active if not set
      if (!activeRole && newRoles.length > 0) {
        setActiveRole(newRoles[0]);
        await setDoc(userRef, { activeRole: newRoles[0] }, { merge: true });
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Switch active role
  const switchRole = async (newRole) => {
    if (!user || !roles.includes(newRole)) return;

    try {
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, { activeRole: newRole }, { merge: true });
      setActiveRole(newRole);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const value = {
    user,
    userProfile,
    roles,
    activeRole,
    loading,
    error,
    isAuthenticated: !!user,
    signInWithGoogle,
    signOutUser,
    updateRoles,
    switchRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
