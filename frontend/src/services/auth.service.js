import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase";

const provider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  const result = await signInWithPopup(auth, provider);
  const user = result.user;
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || "User",
      photoURL: user.photoURL || "",
      phone: "",
      roles: [],
      activeRole: null,
      location: { lat: null, lng: null, address: "" },
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  return user;
};

export const signOutUser = async () => {
  await signOut(auth);
};

export const getCurrentAuthUser = () => auth.currentUser;

export const getUserProfile = async (userId) => {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    throw new Error("User profile not found");
  }

  return userSnap.data();
};

export const updateUserProfile = async (userId, updates) => {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    ...updates,
    updatedAt: new Date(),
  });
};

export const setUserRoles = async (userId, roles) => {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    roles,
    activeRole: roles[0] || null,
    updatedAt: new Date(),
  });
};

export const switchActiveRole = async (userId, roleId) => {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    activeRole: roleId,
    updatedAt: new Date(),
  });
};
