import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../../contexts/CartContext";
import { WishlistContext } from "../../contexts/wishListContext";
import { IMAGE_BASE_URL } from "../../services/api";

const getImageUrl = (value) => {
  if (!value) return "/placeholder.png";
  return value.startsWith("http") ? value : `${IMAGE_BASE_URL}${value}`;
};

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

  if (loading) return <div className="py-20 text-center text-slate-500">Loading your wishlist...</div>;

  return (
    <section className="px-3 py-8 md:px-6 md:py-12">
      <div className="section-shell premium-card rounded-[36px] p-5 md:p-6">
        <p className="section-kicker">Wishlist</p>
        <h1 className="section-title mt-4 text-slate-900">Saved products stay inside the same soft card language.</h1>

        {wishList.length === 0 ? (
          <div className="mt-10 rounded-[28px] bg-white/72 px-6 py-14 text-center">
            <p className="text-slate-500">Your wishlist is empty.</p>
            <button onClick={() => navigate("/products")} className="primary-cta mt-5 px-5 py-3 text-sm">
              Browse products
            </button>
          </div>
        ) : (
          <div className="mt-8 grid gap-4">
            {wishList.map((item) => (
              <div key={item.productId || item.id} className="rounded-[28px] bg-white/72 p-4 md:p-5">
                <div className="grid gap-4 md:grid-cols-[120px_1fr_auto] md:items-center">
                  <img src={getImageUrl(item.imageUrl)} alt={item.name} className="image-bleed h-28 w-full rounded-[22px] md:w-28" />
                  <div>
                    <p className="card-metadata">{item.category || "Saved product"}</p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-900">{item.name}</h2>
                    <p className="mt-2 text-lg font-semibold text-slate-900">Rs {item.price}</p>
                  </div>
                  <div className="flex gap-2 md:flex-col">
                    <button onClick={() => addToCart({ ...item, id: item.productId || item.id })} className="primary-cta px-4 py-3 text-sm">
                      Add to cart
                    </button>
                    <button onClick={() => removeFromWishlist(item.productId)} className="ghost-cta px-4 py-3 text-sm">
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Wishlist;
