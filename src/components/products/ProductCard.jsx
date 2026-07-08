import React, { useContext, useEffect, useState } from "react";
import { FaHeart, FaRegHeart, FaShoppingBag } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { getAllProducts, IMAGE_BASE_URL } from "../../services/api";
import { CartContext } from "../../contexts/CartContext";
import { WishlistContext } from "../../contexts/wishListContext";
import Search from "./Search";

const getImageUrl = (value) => {
  if (!value) return "https://via.placeholder.com/200";
  return value.startsWith("http") ? value.replace(":7071", ":5252") : `${IMAGE_BASE_URL}${value}`;
};

const ProductCard = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useContext(WishlistContext);
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getAllProducts();
        setProducts(data ?? []);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) {
    return <div className="py-20 text-center text-slate-500">Loading products...</div>;
  }

  return (
    <>
      <Search />
      <section className="section-shell px-3 pb-12 pt-8 md:px-0">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="section-kicker">Inventory</p>
            <h2 className="section-title mt-4 text-slate-900">Explore Our Premium Gear</h2>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <article
              key={product.id}
              className="premium-card group overflow-hidden rounded-[30px] border border-white/75 bg-white/82 p-3 shadow-[0_16px_34px_rgba(148,163,184,0.10),inset_0_1px_0_rgba(255,255,255,0.88)] transition duration-300 hover:shadow-[0_20px_38px_rgba(148,163,184,0.14),inset_0_1px_0_rgba(255,255,255,0.9)]"
              onClick={() => navigate(`/products/${product.id}`)}
            >
              <div className="relative overflow-hidden rounded-[24px] border border-slate-200/45 bg-linear-to-b from-white to-[#f3f4ef]">
                <img src={getImageUrl(product.imageUrl)} alt={product.name} className="image-bleed h-64 w-full transition duration-300 group-hover:scale-[1.03]" />
                <span className="absolute left-3 top-3 floating-chip px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-700">
                  {product.categoryName || "Featured"}
                </span>
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    isInWishlist(product.id) ? removeFromWishlist(product.id) : addToWishlist(product);
                  }}
                  className="absolute right-3 top-3 soft-pill p-3"
                >
                  {isInWishlist(product.id) ? <FaHeart className="text-[#ff8d49]" /> : <FaRegHeart className="text-slate-500" />}
                </button>
              </div>

              <div className="mt-3 border-t border-slate-200/70 p-2 pt-4">
                <p className="card-metadata">{product.brand || "FitN"}</p>
                <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-900">{product.name}</h3>
                <p className="mt-2 text-sm text-slate-500">
                  {product.sport || "Sports essential"} {product.shortDescription ? `· ${product.shortDescription}` : ""}
                </p>
                <div className="mt-5 flex items-end justify-between gap-3">
                  <p className="text-xl font-semibold tracking-[-0.04em] text-slate-900">Rs {product.price || "—"}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        addToCart(product);
                      }}
                      className="soft-pill p-3 text-slate-700"
                    >
                      <FaShoppingBag size={14} />
                    </button>
                    <button className="primary-cta px-4 py-2 text-sm">Details</button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
};

export default ProductCard;
