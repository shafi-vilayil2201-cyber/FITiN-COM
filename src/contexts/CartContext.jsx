import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext.jsx";
import { toast } from "react-toastify";

export const CartContext = createContext();

/* Environment-based BASE URL */
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [cart, setCart] = useState([]);
  const [wishList, setWishList] = useState([]);

  /* -----------------------------------------------------------
     Load cart from backend for logged-in user
  ----------------------------------------------------------- */
  useEffect(() => {
    const fetchUserCart = async () => {
      if (!user || !user.id) return;

      try {
        const res = await axios.get(`${API_BASE}/users/${encodeURIComponent(user.id)}`);
        setCart(res.data.cart || []);
      } catch (error) {
        console.error("Error fetching user cart:", error);
      }
    };

    fetchUserCart();
  }, [user]);

  /* -----------------------------------------------------------
     Helper: sync cart to backend
  ----------------------------------------------------------- */
  const syncCartToBackend = async (updatedCart) => {
    if (!user || !user.id) return;

    try {
      await axios.patch(`${API_BASE}/users/${encodeURIComponent(user.id)}`, {
        cart: updatedCart,
      });
    } catch (error) {
      console.error("Error syncing cart:", error);
    }
  };

  /* -----------------------------------------------------------
     Add to Cart
  ----------------------------------------------------------- */
  const addToCart = (product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      let updated;

      if (existing) {
        updated = prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        updated = [...prevCart, { ...product, quantity: 1 }];
      }

      syncCartToBackend(updated);
      return updated;
    });

    toast.success("Added to cart!");
  };

  /* -----------------------------------------------------------
     Remove Item
  ----------------------------------------------------------- */
  const removeFromCart = (id) => {
    setCart((prevCart) => {
      const updated = prevCart.filter((item) => item.id !== id);
      syncCartToBackend(updated);
      return updated;
    });
  };

  /* -----------------------------------------------------------
     Increase Qty
  ----------------------------------------------------------- */
  const increaseQty = (id) => {
    setCart((prevCart) => {
      const updated = prevCart.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      );

      syncCartToBackend(updated);
      return updated;
    });
  };

  /* -----------------------------------------------------------
     Decrease Qty
  ----------------------------------------------------------- */
  const decreaseQty = (id) => {
    setCart((prevCart) => {
      const updated = prevCart
        .map((item) =>
          item.id === id
            ? { ...item, quantity: Math.max(item.quantity - 1, 1) }
            : item
        )
        .filter((item) => item.quantity > 0);

      syncCartToBackend(updated);
      return updated;
    });

    toast.success("Quantity decreased");
  };

  /* -----------------------------------------------------------
     Clear Cart
  ----------------------------------------------------------- */
  const clearCart = () => {
    setCart([]);
    syncCartToBackend([]);
  };

  /* -----------------------------------------------------------
     Proceed to Buy (update stock in backend)
  ----------------------------------------------------------- */
  const proceedToBuy = async () => {
    try {
      for (let item of cart) {
        const newStock = Math.max(Number(item.stock || 0) - Number(item.quantity || 1), 0);

        await axios.patch(`${API_BASE}/products/${encodeURIComponent(item.id)}`, {
          stock: newStock,
        });
      }

      toast.success("Purchase successful");
      clearCart();
    } catch (error) {
      console.error("Error updating stock:", error);
      alert("Failed to process purchase");
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        increaseQty,
        decreaseQty,
        proceedToBuy,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};