import React, { useState, useEffect, useContext } from "react";
import { FaLeaf, FaShieldAlt, FaBolt, FaHeart, FaRegHeart, FaShoppingBag } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { getAllSupplements, IMAGE_BASE_URL } from "../services/api";
import { CartContext } from "../contexts/CartContext";
import { WishlistContext } from "../contexts/wishListContext";

const filterOptions = ["All", "Protein", "Energy", "Wellness", "Hydration", "Recovery"];

const highlights = [
  {
    title: "Clean Formulas",
    copy: "Sourced from verified premium suppliers, ensuring 100% purity and label accuracy.",
    icon: <FaLeaf size={14} />,
  },
  {
    title: "Expert Curation",
    copy: "Formulations designed in collaboration with certified nutrition coaches and scientists.",
    icon: <FaShieldAlt size={14} />,
  },
  {
    title: "Optimal Performance",
    copy: "Products engineered to integrate seamlessly with your active training and recovery routine.",
    icon: <FaBolt size={14} />,
  },
];

const getImageUrl = (value) => {
  if (!value) return "https://via.placeholder.com/300";
  return value.startsWith("http") ? value.replace(":7071", ":5252") : `${IMAGE_BASE_URL}${value}`;
};

const Supplements = () => {
  const [supplements, setSupplements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
  const navigate = useNavigate();

  const { addToCart, isInCart } = useContext(CartContext);
  const { addToWishlist, removeFromWishlist, isInWishlist } = useContext(WishlistContext);

  useEffect(() => {
    const fetchSupplements = async () => {
      try {
        setLoading(true);
        const data = await getAllSupplements();
        setSupplements(data ?? []);
      } catch (error) {
        console.error("Error fetching supplements from backend:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSupplements();
  }, []);

  const visibleItems =
    activeFilter === "All"
      ? supplements
      : supplements.filter(
          (item) => (item.categoryName || "").toLowerCase() === activeFilter.toLowerCase()
        );

  return (
    <div className="section-shell px-3 pb-12 pt-6 md:px-0">
      <div className="premium-card rounded-[36px] p-5 md:p-6">
        <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="section-kicker">Supplements</p>
            <h1 className="section-title mt-4 text-slate-900">Premium Supplements & Nutrition</h1>
            <p className="body-copy mt-5 max-w-2xl">
              Scientifically formulated proteins, vitamins, and energy essentials curated to support your fitness and recovery goals.
            </p>
          </div>

          <div className="premium-panel rounded-[28px] p-5">
            <div className="grid gap-4">
              {highlights.map((item) => (
                <div key={item.title} className="flex items-start gap-3 rounded-[22px] border border-white/70 bg-white/65 px-4 py-4">
                  <div className="soft-pill p-3 text-slate-700">{item.icon}</div>
                  <div>
                    <p className="text-sm font-semibold tracking-[-0.02em] text-slate-900">{item.title}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">{item.copy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          {filterOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setActiveFilter(option)}
              className={`soft-pill px-4 py-3 text-sm font-medium transition ${
                activeFilter === option ? "bg-slate-900 text-white" : "text-slate-700"
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-500">Loading supplements shelf...</div>
        ) : visibleItems.length === 0 ? (
          <div className="py-20 text-center text-slate-400 font-medium italic">
            No supplement items found in this category.
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {visibleItems.map((item) => (
              <article
                key={item.id}
                className="premium-card group overflow-hidden rounded-[30px] border border-white/75 bg-white/82 p-3 shadow-[0_16px_34px_rgba(148,163,184,0.10),inset_0_1px_0_rgba(255,255,255,0.88)] transition duration-300 hover:shadow-[0_20px_38px_rgba(148,163,184,0.14),inset_0_1px_0_rgba(255,255,255,0.9)]"
                onClick={() => navigate(`/supplements/${item.id}`)}
              >
                <div className="relative overflow-hidden rounded-[24px] border border-slate-200/45 bg-linear-to-b from-white to-[#f3f4ef]">
                  <img src={getImageUrl(item.imageUrl)} alt={item.name} className="image-bleed h-72 w-full transition duration-300 group-hover:scale-[1.03]" />
                  <span className="absolute left-3 top-3 floating-chip px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-700">
                    {item.categoryName || "Featured"}
                  </span>
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      isInWishlist(item.id) ? removeFromWishlist(item.id) : addToWishlist(item);
                    }}
                    className="absolute right-3 top-3 soft-pill p-3"
                  >
                    {isInWishlist(item.id) ? <FaHeart className="text-[#ff8d49]" /> : <FaRegHeart className="text-slate-500" />}
                  </button>
                </div>

                <div className="mt-3 border-t border-slate-200/70 p-2 pt-4">
                  <p className="card-metadata">{item.brand || "FitN"}</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-900">{item.name}</h2>
                  <p className="mt-2 text-sm text-slate-500 line-clamp-2">
                    {item.shortDescription || item.description || "Premium nutritional formula."}
                  </p>
                  <div className="mt-5 flex items-end justify-between gap-3">
                    <p className="text-xl font-semibold tracking-[-0.04em] text-slate-900">
                      Rs {Number(item.price ?? 0).toLocaleString("en-IN")}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          addToCart(item);
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
        )}
      </div>
    </div>
  );
};

export default Supplements;
