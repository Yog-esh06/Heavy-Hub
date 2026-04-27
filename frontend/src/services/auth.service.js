import { auth, db } from "../config/firebase";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";

const provider = new GoogleAuthProvider();
provider.addScope("email");
provider.addScope("profile");

export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, provider);
  const user = result.user;

  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      phone: "",
      role: null,
      activeRole: null,
      roles: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { user, isNewUser: true };
  }

  return { user, isNewUser: false, userData: userSnap.data() };
}

export async function logOut() {
  await signOut(auth);
}

export async function getUserData(uid) {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);
  return snap.exists() ? snap.data() : null;
}

export async function updateUserRole(uid, role) {
  const userRef = doc(db, "users", uid);
  const existing = await getUserData(uid);
  const currentRoles = existing?.roles || [];
  const nextRoles = currentRoles.includes(role) ? currentRoles : [...currentRoles, role];

  await setDoc(
    userRef,
    {
      role,
      roles: nextRoles,
      activeRole: role,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function signOutUser() {
  await logOut();
}

export const getCurrentAuthUser = () => auth.currentUser;

export async function getUserProfile(userId) {
  const userData = await getUserData(userId);
  if (!userData) {
    throw new Error("User profile not found");
  }
  return userData;
}

export async function updateUserProfile(userId, updates) {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export async function setUserRoles(userId, roles) {
  const userRef = doc(db, "users", userId);
  await setDoc(
    userRef,
    {
      roles,
      role: roles[0] || null,
      activeRole: roles[0] || null,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  return getUserData(userId);
}

export async function switchActiveRole(userId, roleId) {
  const userRef = doc(db, "users", userId);
  await setDoc(
    userRef,
    {
      activeRole: roleId,
      role: roleId,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  return getUserData(userId);
}
