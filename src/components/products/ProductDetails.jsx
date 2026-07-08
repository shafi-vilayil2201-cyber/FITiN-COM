import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProductById, getSupplementById, IMAGE_BASE_URL } from "../../services/api.js";
import { CartContext } from "../../contexts/CartContext.jsx";
import { WishlistContext } from "../../contexts/wishListContext.jsx";

const getImageUrl = (value) => {
  if (!value) return "https://via.placeholder.com/400";
  return value.startsWith("http") ? value.replace(":7071", ":5252") : `${IMAGE_BASE_URL}${value}`;
};

const ProductDetails = ({ isSupplement = false }) => {
  const { id } = useParams();
  const [details, setDetails] = useState(null);
  const [pending, setPending] = useState(true);
  const { addToCart, isInCart } = useContext(CartContext);
  const { addToWishlist, removeFromWishlist, isInWishlist } = useContext(WishlistContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      setPending(true);
      try {
        const data = isSupplement ? await getSupplementById(id) : await getProductById(id);
        setDetails(data);
      } catch (error) {
        console.error("Error fetching product details:", error);
      } finally {
        setPending(false);
      }
    };
    fetchProduct();
  }, [id, isSupplement]);

  if (pending) return <div className="py-20 text-center text-slate-500">Loading product details...</div>;
  if (!details) return <div className="py-20 text-center text-slate-500">Product not found.</div>;

  const finalPrice = details.discount > 0 ? details.price - (details.price * details.discount) / 100 : details.price;

  return (
    <section className="px-3 py-8 md:px-6 md:py-12">
      <div className="section-shell premium-card rounded-[38px] p-4 md:p-6">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="overflow-hidden rounded-[30px] border border-slate-200/70 bg-white/82 p-3 shadow-[0_18px_38px_rgba(148,163,184,0.10),inset_0_1px_0_rgba(255,255,255,0.92)]">
            <img src={getImageUrl(details.imageUrl)} alt={details.name} className="image-bleed h-[420px] w-full rounded-[26px] md:h-[620px]" />
          </div>

          <div className="p-2 md:p-4">
            <p className="section-kicker">{details.categoryName || "Product detail"}</p>
            <h1 className="display-title mt-5 text-slate-900">{details.name}</h1>
            <p className="mt-3 text-base font-medium text-slate-500">
              {details.brand || "FitN"} {details.sport ? `· ${details.sport}` : ""}
            </p>

            <div className="mt-8 flex flex-wrap items-end gap-4">
              <p className="text-4xl font-semibold tracking-[-0.05em] text-slate-900">
                Rs {Number(finalPrice ?? 0).toLocaleString("en-IN")}
              </p>
              {details.discount > 0 && (
                <>
                  <p className="text-lg text-slate-400 line-through">
                    Rs {Number(details.price ?? 0).toLocaleString("en-IN")}
                  </p>
                  <span className="rounded-full bg-[#ff8d49] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-white">
                    {details.discount}% off
                  </span>
                </>
              )}
            </div>

            <p className="body-copy mt-6">
              {details.description || details.shortDescription || "No product description available."}
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-[24px] border border-slate-200/70 bg-white/82 p-4 shadow-[0_12px_28px_rgba(148,163,184,0.10),inset_0_1px_0_rgba(255,255,255,0.92)]">
                <p className="card-metadata">Rating</p>
                <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-900">⭐ {details.rating || "4.8"}</p>
              </div>
              <div className="rounded-[24px] border border-slate-200/70 bg-white/82 p-4 shadow-[0_12px_28px_rgba(148,163,184,0.10),inset_0_1px_0_rgba(255,255,255,0.92)]">
                <p className="card-metadata">Stock</p>
                <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-900">{details.stock > 0 ? details.stock : "Sold out"}</p>
              </div>
              <div className="rounded-[24px] border border-slate-200/70 bg-white/82 p-4 shadow-[0_12px_28px_rgba(148,163,184,0.10),inset_0_1px_0_rgba(255,255,255,0.92)]">
                <p className="card-metadata">Brand</p>
                <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-900">{details.brand || "FitN"}</p>
              </div>
            </div>

            {details.longDescription && (
              <div className="mt-6 rounded-[26px] border border-slate-200/70 bg-white/82 p-5 shadow-[0_12px_28px_rgba(148,163,184,0.10),inset_0_1px_0_rgba(255,255,255,0.92)]">
                <p className="card-metadata">Overview</p>
                <p className="mt-3 text-sm leading-7 text-slate-600">{details.longDescription}</p>
              </div>
            )}

            <div className="mt-8 flex flex-wrap gap-3 rounded-[28px] border border-slate-200/65 bg-white/74 p-4 shadow-[0_10px_24px_rgba(148,163,184,0.08),inset_0_1px_0_rgba(255,255,255,0.90)]">
              <button
                onClick={() => addToCart(details)}
                disabled={details.stock <= 0}
                className={`px-6 py-4 text-sm ${details.stock <= 0 ? "ghost-cta opacity-60" : isInCart(details.id) ? "ghost-cta" : "primary-cta"}`}
              >
                {details.stock <= 0 ? "Sold out" : isInCart(details.id) ? "Already in cart" : "Add to cart"}
              </button>
              <button
                onClick={() => navigate("/checkout", { state: { product: details } })}
                disabled={details.stock <= 0}
                className="accent-cta px-6 py-4 text-sm disabled:opacity-60"
              >
                Buy now
              </button>
              <button
                onClick={() => (isInWishlist(details.id) ? removeFromWishlist(details.id) : addToWishlist(details))}
                className="ghost-cta px-6 py-4 text-sm"
              >
                {isInWishlist(details.id) ? "Saved" : "Save to wishlist"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductDetails;
