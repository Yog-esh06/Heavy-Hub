import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "../config/firebase";

const getCartCollection = (uid) => collection(db, "cart", uid, "items");

export const getCartItems = async (uid) => {
  const snapshot = await getDocs(getCartCollection(uid));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
};

export const addCartItem = async (uid, item) => {
  const payload = {
    ...item,
    addedAt: new Date(),
  };
  const ref = await addDoc(getCartCollection(uid), payload);
  return { id: ref.id, ...payload };
};

export const updateCartItem = async (uid, cartItemId, updates) => {
  const ref = doc(db, "cart", uid, "items", cartItemId);
  await updateDoc(ref, {
    ...updates,
    updatedAt: new Date(),
  });
};

export const removeCartItem = async (uid, cartItemId) => {
  const ref = doc(db, "cart", uid, "items", cartItemId);
  await deleteDoc(ref);
};

export const clearCartItems = async (uid) => {
  const snapshot = await getDocs(getCartCollection(uid));
  const batch = writeBatch(db);

  snapshot.docs.forEach((item) => batch.delete(item.ref));
  await batch.commit();
};
