import React, { createContext, useEffect, useState, useContext } from "react";
import { getWishlist, addToWishlistAPI, removeFromWishlistAPI } from "../services/api";
import { toast } from "react-toastify";
import { AuthContext } from "./AuthContext";

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [wishList, setWishlist] = useState([]);

  // 1. Fetch wishlist from backend
  const refreshWishlist = async () => {
    if (!user) {
      setWishlist([]);
      return;
    }
    try {
      const data = await getWishlist();
      setWishlist(data || []);
    } catch (error) {
      console.error("Failed to fetch wishlist", error);
    }
  };

  useEffect(() => {
    refreshWishlist();
  }, [user]);

  // 2. Add to wishlist
  const addToWishlist = async (product) => {
    if (!user) {
      toast.info("Please login to use the wishlist");
      return;
    }

    // Avoid duplicates
    if (wishList.some((item) => item.id === product.id)) {
      toast.info("Item already in wishlist");
      return;
    }

    try {
      await addToWishlistAPI(product.id); // Call the API from api.js
      setWishlist((prev) => [...prev, product]);
      toast.success("Added to wishlist");
    } catch (error) {
      toast.error("Failed to add to wishlist");
    }
  };

  // 3. Remove from wishlist
  const removeFromWishlist = async (productId) => {
    if (!user) return;
    try {
      await removeFromWishlistAPI(productId);
      setWishlist((prev) => prev.filter((item) => item.id !== productId));
      toast.info("Removed from wishlist");
    } catch (error) {
      toast.error("Failed to remove item");
    }
  };

  // 4. Helper to check if item is in wishlist
  const isInWishlist = (productId) => {
    return wishList.some((item) => item.id === productId);
  };

  return (
    <WishlistContext.Provider
      value={{ wishList, addToWishlist, removeFromWishlist, refreshWishlist, isInWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
};
