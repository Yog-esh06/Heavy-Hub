import {
  doc,
  getDoc,
  updateDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../config/firebase";

/**
 * Get user profile
 */
export const getUserProfile = async (userId) => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      throw new Error("User profile not found");
    }

    return { id: userSnap.id, ...userSnap.data() };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (userId, updates) => {
  try {
    const userRef = doc(db, "users", userId);

    await updateDoc(userRef, {
      ...updates,
      updatedAt: new Date(),
    });

    return await getUserProfile(userId);
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

/**
 * Update user location
 */
export const updateUserLocation = async (userId, location) => {
  try {
    const userRef = doc(db, "users", userId);

    await updateDoc(userRef, {
      location: {
        lat: location.lat,
        lng: location.lng,
        address: location.address || "",
      },
      updatedAt: new Date(),
    });

    return await getUserProfile(userId);
  } catch (error) {
    console.error("Error updating user location:", error);
    throw error;
  }
};

/**
 * Set user roles
 */
export const setUserRoles = async (userId, roles) => {
  try {
    const userRef = doc(db, "users", userId);

    await updateDoc(userRef, {
      roles,
      activeRole: roles[0] || null,
      updatedAt: new Date(),
    });

    return await getUserProfile(userId);
  } catch (error) {
    console.error("Error setting user roles:", error);
    throw error;
  }
};

/**
 * Switch active role
 */
export const switchActiveRole = async (userId, roleId) => {
  try {
    const userRef = doc(db, "users", userId);

    await updateDoc(userRef, {
      activeRole: roleId,
      updatedAt: new Date(),
    });

    return await getUserProfile(userId);
  } catch (error) {
    console.error("Error switching role:", error);
    throw error;
  }
};

/**
 * Add role to user
 */
export const addUserRole = async (userId, role) => {
  try {
    const userProfile = await getUserProfile(userId);
    const currentRoles = userProfile.roles || [];

    if (!currentRoles.includes(role)) {
      const newRoles = [...currentRoles, role];
      return await setUserRoles(userId, newRoles);
    }

    return userProfile;
  } catch (error) {
    console.error("Error adding user role:", error);
    throw error;
  }
};

/**
 * Remove role from user
 */
export const removeUserRole = async (userId, role) => {
  try {
    const userProfile = await getUserProfile(userId);
    const currentRoles = userProfile.roles || [];

    const newRoles = currentRoles.filter((r) => r !== role);
    return await setUserRoles(userId, newRoles);
  } catch (error) {
    console.error("Error removing user role:", error);
    throw error;
  }
};

/**
 * Get all users (admin)
 */
export const getAllUsers = async () => {
  try {
    const q = query(collection(db, "users"));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

/**
 * Get users by role
 */
export const getUsersByRole = async (role) => {
  try {
    const q = query(
      collection(db, "users"),
      where("roles", "array-contains", role)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching users by role:", error);
    throw error;
  }
};

/**
 * Get user by email
 */
export const getUserByEmail = async (email) => {
  try {
    const q = query(collection(db, "users"), where("email", "==", email));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  } catch (error) {
    console.error("Error fetching user by email:", error);
    throw error;
  }
};