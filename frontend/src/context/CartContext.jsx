import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { useAuth } from "./AuthContext";
import { cartAPI } from "../api/marketplace";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const resetCart = () => {
    setCart(null);
    setError("");
  };

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);
  const toggleDrawer = () => setIsDrawerOpen((current) => !current);

  const refreshCart = async () => {
    if (!user) {
      resetCart();
      return null;
    }

    setLoading(true);
    setError("");

    try {
      const data = await cartAPI.getCart();
      setCart(data);
      return data;
    } catch (err) {
      if (err?.response?.status === 401) {
        resetCart();
      } else {
        setError(err?.response?.data?.detail || "Unable to load cart.");
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();
  }, [user?.id]);

  const addItem = async (productId, quantity = 1) => {
    const data = await cartAPI.addItem(productId, quantity);
    setCart(data);
    return data;
  };

  const updateItem = async (cartItemId, quantity) => {
    const data = await cartAPI.updateItem(cartItemId, quantity);
    setCart(data);
    return data;
  };

  const removeItem = async (cartItemId) => {
    const data = await cartAPI.removeItem(cartItemId);
    setCart(data);
    return data;
  };

  const clearCart = async () => {
    const data = await cartAPI.clearCart();
    setCart(data);
    return data;
  };

  const value = {
    cart,
    items: cart?.items || [],
    totalItems: cart?.total_items || 0,
    totalPrice: cart?.total_price || 0,
    loading,
    error,
    isDrawerOpen,
    refreshCart,
    addItem,
    updateItem,
    removeItem,
    clearCart,
    openDrawer,
    closeDrawer,
    toggleDrawer,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => useContext(CartContext);