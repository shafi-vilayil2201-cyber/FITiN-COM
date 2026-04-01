import React, { createContext, useState, useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext.jsx";
import { toast } from "react-toastify";
import {
  getCart,
  addToCartAPI,
  removeFromCartAPI,
  increaseCartQtyAPI,
  decreaseCartQtyAPI,
} from "../services/api";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [cart, setCart] = useState([]);

  // 1. Fetch cart from backend
  const refreshCart = async () => {
    if (!user) {
      setCart([]);
      return;
    }
    try {
      const data = await getCart();
      setCart(data || []);
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  };

  useEffect(() => {
    refreshCart();
  }, [user]);

  // 2. Add to Cart (show message if already in cart)
  const addToCart = async (product) => {
    if (!user) {
      toast.info("Please login to add items to cart");
      return;
    }

    // Check if item already exists in cart
    if (cart.some((item) => item.id === product.id || item.productId === product.id)) {
      toast.info("Item already in cart");
      return;
    }

    try {
      await addToCartAPI(product.id);
      await refreshCart(); // Refresh to get updated cart from backend
      toast.success("Added to cart!");
    } catch (error) {
      toast.error("Failed to add to cart");
    }
  };

  // 3. Remove from Cart
  const removeFromCart = async (productId) => {
    if (!user) return;
    try {
      await removeFromCartAPI(productId);
      setCart((prev) => prev.filter((item) => item.id !== productId && item.productId !== productId));
      toast.info("Removed from cart");
    } catch (error) {
      toast.error("Failed to remove item");
    }
  };

  // 4. Increase Quantity
  const increaseQty = async (productId) => {
    try {
      await increaseCartQtyAPI(productId);
      await refreshCart();
    } catch (error) {
      toast.error("Failed to increase quantity");
    }
  };

  // 5. Decrease Quantity
  const decreaseQty = async (productId) => {
    try {
      await decreaseCartQtyAPI(productId);
      await refreshCart();
    } catch (error) {
      toast.error("Failed to decrease quantity");
    }
  };

  // 6. Clear Cart (remove all items one by one)
  const clearCart = async () => {
    try {
      for (let item of cart) {
        await removeFromCartAPI(item.productId || item.id);
      }
      setCart([]);
    } catch (error) {
      console.error("Failed to clear cart:", error);
    }
  };

  // Helper: check if item is in cart
  const isInCart = (productId) => {
    return cart.some((item) => item.id === productId || item.productId === productId);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        increaseQty,
        decreaseQty,
        clearCart,
        refreshCart,
        isInCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
