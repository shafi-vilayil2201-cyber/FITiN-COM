
import React, { createContext, useEffect, useState, useContext } from "react";
import { getWishlist, addToWishlistAPI, removeFromWishlistAPI } from "../services/api";
import { toast } from "react-toastify";
import { AuthContext } from "./AuthContext";

export const WishlistContext = createContext();

export const WishlistProvider = ({ children, localWishlist = [] }) => {
  const { user } = useContext(AuthContext);
  const userId = user?.id;

  const [wishList, setWishlist] = useState([]);

  const mergeLocalWithDB = async (dbWishlist) => {
    for (let item of localWishlist) {
      if (!dbWishlist.some((i) => String(i.id) === String(item.id))) {
        try {
          await addToWishlistAPI(userId, item);
        } catch (err) {
          console.error("Failed to merge item into wishlist:", err);
        }
      }
    }
  };

  const refreshWishlist = async () => {
    if (!userId || user.role === 'admin') {
      setWishlist([]);
      return;
    }
    try {
      const dbWishlist = (await getWishlist(userId)) || [];
      await mergeLocalWithDB(dbWishlist);
      const updatedWishlist = (await getWishlist(userId)) || [];
      setWishlist(updatedWishlist);
    } catch (err) {
      console.error("Failed to refresh wishlist:", err);
      setWishlist([]);
    }
  };

  useEffect(() => {
    refreshWishlist();
  }, [userId]);

  const addToWishlist = async (product) => {
    if (!userId || user.role === 'admin') {
      toast.info("Please log in to add items to your wishlist!");
      return;
    }
    if (wishList.some((i) => String(i.id) === String(product.id))) return;

    const minimalProduct = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
    };

    setWishlist((prev) => [...prev, minimalProduct]);
    toast.success("Added to wishlist!");

    try {
      await addToWishlistAPI(userId, minimalProduct);
    } catch (err) {
      console.error("Failed to add to wishlist:", err);
      toast.error("Failed to add to wishlist");
      setWishlist((prev) => prev.filter((i) => i.id !== product.id));
    }
  };

  const removeFromWishlist = async (productId) => {
    if (!userId) return;
    setWishlist((prev) => prev.filter((i) => i.id !== productId));
    toast.info("Removed from wishlist");

    try {
      await removeFromWishlistAPI(userId, productId);
    } catch (err) {
      console.error("Failed to remove wishlist item:", err);
      toast.error("Failed to remove item");
      await refreshWishlist();
    }
  };

  return (
    <WishlistContext.Provider
      value={{ wishList, addToWishlist, removeFromWishlist, refreshWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
};