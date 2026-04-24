import React, { createContext, useCallback, useEffect, useState } from "react";
import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc, writeBatch } from "firebase/firestore";
import { useAuth } from "../auth/useAuth";
import { db } from "../config/firebase";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user, loading } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartError, setCartError] = useState(null);

  const loadCart = useCallback(async () => {
    if (!user) {
      setCartItems([]);
      return [];
    }

    try {
      setCartLoading(true);
      const snapshot = await getDocs(collection(db, "cart", user.uid, "items"));
      const items = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
      setCartItems(items);
      setCartError(null);
      return items;
    } catch (err) {
      setCartError(err.message);
      return [];
    } finally {
      setCartLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!loading) {
      loadCart();
    }
  }, [loadCart, loading]);

  const addToCart = useCallback(
    async (item) => {
      if (!user) {
        throw new Error("Must be logged in to add to cart");
      }

      const payload = { ...item, addedAt: new Date() };
      const docRef = await addDoc(collection(db, "cart", user.uid, "items"), payload);
      setCartItems((current) => [...current, { id: docRef.id, ...payload }]);
      return docRef.id;
    },
    [user]
  );

  const removeFromCart = useCallback(
    async (cartItemId) => {
      if (!user) return;
      await deleteDoc(doc(db, "cart", user.uid, "items", cartItemId));
      setCartItems((current) => current.filter((item) => item.id !== cartItemId));
    },
    [user]
  );

  const updateCartItem = useCallback(
    async (cartItemId, updates) => {
      if (!user) return;
      await updateDoc(doc(db, "cart", user.uid, "items", cartItemId), {
        ...updates,
        updatedAt: new Date(),
      });
      setCartItems((current) =>
        current.map((item) => (item.id === cartItemId ? { ...item, ...updates } : item))
      );
    },
    [user]
  );

  const clearCart = useCallback(async () => {
    if (!user) return;
    const snapshot = await getDocs(collection(db, "cart", user.uid, "items"));
    const batch = writeBatch(db);
    snapshot.docs.forEach((item) => batch.delete(item.ref));
    await batch.commit();
    setCartItems([]);
  }, [user]);

  const totalItems = cartItems.length;
  const totalAmount = cartItems.reduce((sum, item) => sum + Number(item.totalAmount || 0), 0);

  const value = {
    cartItems,
    totalItems,
    cartCount: totalItems,
    totalAmount,
    cartLoading,
    cartError,
    addToCart,
    removeFromCart,
    updateCartItem,
    clearCart,
    loadCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = React.useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};
