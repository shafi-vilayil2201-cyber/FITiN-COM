import React, { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { WishlistContext } from "../../contexts/wishListContext";
import { CartContext } from "../../contexts/CartContext";
import { useNavigate } from "react-router-dom";

const Wishlist = () => {
  const { wishList, removeFromWishlist, refreshWishlist } = useContext(WishlistContext);
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await refreshWishlist();
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p className="text-gray-700 text-lg">Loading your wishlist...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 px-4 sm:px-8">
      <h1 className="text-center text-3xl font-extrabold text-emerald-700 mb-10">
        Your Wishlist
      </h1>

      {wishList.length === 0 ? (
        <div className="flex flex-col justify-center items-center text-gray-700 mt-20">
          <p className="text-lg mb-3">Your wishlist is empty</p>
          <button
            onClick={() => navigate("/products")}
            className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition"
          >
            Browse Products
          </button>
        </div>
      ) : (
        <div className="space-y-4 max-w-4xl mx-auto">
          {wishList.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between bg-white rounded-xl shadow-md px-5 py-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-4">
                <img
                  src={item.imageUrl || "/placeholder.png"}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-lg border border-amber-100"
                />
                <div>
                  <h2 className="font-semibold text-lg text-gray-800">{item.name}</h2>
                  <p className="text-emerald-600 font-bold text-lg">₹{item.price}</p>
                  <p className="text-sm text-gray-500">{item.category}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => {
                    addToCart(item);
                    toast.success("Added to cart!");
                  }}
                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition"
                >
                  Add to Cart
                </button>
                <button
                  onClick={() => removeFromWishlist(item.id)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;