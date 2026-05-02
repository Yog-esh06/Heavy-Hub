import React, { createContext, useContext } from "react";
import { addToCart, clearCart, getCart, removeFromCart, updateCartItem } from "../services/cart.service";
import { useAuth } from "../auth/useAuth";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = React.useState([]);
  const [cartLoading, setCartLoading] = React.useState(false);
  const [cartError, setCartError] = React.useState(null);

  const loadCart = React.useCallback(async () => {
    if (!user?.id) {
      setCartItems([]);
      return [];
    }

    try {
      setCartLoading(true);
      const items = await getCart(user.id);
      setCartItems(items);
      setCartError(null);
      return items;
    } catch (err) {
      setCartError(err.message);
      return [];
    } finally {
      setCartLoading(false);
    }
  }, [user?.id]);

  React.useEffect(() => {
    loadCart();
  }, [loadCart]);

  const addItem = React.useCallback(
    async (item) => {
      if (!user?.id) {
        throw new Error("Must be logged in to add to cart");
      }
      const newItem = await addToCart(user.id, item);
      setCartItems((prev) => [newItem, ...prev]);
      return newItem;
    },
    [user?.id]
  );

  const removeItem = React.useCallback(async (itemId) => {
    await removeFromCart(itemId);
    setCartItems((prev) => prev.filter((item) => item.id !== itemId));
  }, []);

  const updateItem = React.useCallback(async (itemId, updates) => {
    const updated = await updateCartItem(itemId, updates);
    setCartItems((prev) => prev.map((item) => (item.id === itemId ? updated : item)));
    return updated;
  }, []);

  const clearAll = React.useCallback(async () => {
    if (!user?.id) return;
    await clearCart(user.id);
    setCartItems([]);
  }, [user?.id]);

  const cartCount = cartItems.length;
  const totalAmount = cartItems.reduce((sum, item) => sum + Number(item.totalAmount || 0), 0);

  const value = {
    cartItems,
    cartLoading,
    cartError,
    totalItems: cartCount,
    cartCount,
    totalAmount,
    addItem,
    removeItem,
    updateItem,
    clearAll,
    loadCart,
    addToCart: addItem,
    removeFromCart: removeItem,
    updateCartItem: updateItem,
    clearCart: clearAll,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};
