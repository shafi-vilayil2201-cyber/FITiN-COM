import React, { useContext, useEffect, useState } from "react";
import { FaHeart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { getAllProducts, IMAGE_BASE_URL } from "../../services/api";
import { WishlistContext } from "../../contexts/wishListContext";

const getImageUrl = (value) => {
  if (!value) return "https://via.placeholder.com/200";
  return value.startsWith("http") ? value.replace(":7071", ":5252") : `${IMAGE_BASE_URL}${value}`;
};

const Search = () => {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("none");
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const { addToWishlist, removeFromWishlist, isInWishlist } = useContext(WishlistContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await getAllProducts();
        setProducts(res ?? []);
        setCategories([...new Set((res ?? []).map((product) => product.categoryName).filter(Boolean))]);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    let result = [...products];
    if (searchTerm) result = result.filter((product) => product.name.toLowerCase().includes(searchTerm.toLowerCase()));
    if (category !== "all") result = result.filter((product) => product.categoryName === category);
    if (sort === "low-high") result.sort((a, b) => a.price - b.price);
    if (sort === "high-low") result.sort((a, b) => b.price - a.price);
    setFiltered(result);
  }, [searchTerm, category, sort, products]);

  return (
    <div className="section-shell px-3 pt-6 md:px-0">
      <div className="premium-card rounded-[34px] p-5 md:p-6">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="section-kicker">Product listing</p>
            <h1 className="section-title mt-4 text-slate-900">Discover the right fit, faster.</h1>
          </div>
          <p className="body-copy max-w-md text-sm">
            Filters, search, and sorting live inside the same soft card framework as the rest of the store.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-[1.6fr_0.8fr_0.8fr]">
          <input
            type="text"
            placeholder="Search products"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="rounded-[22px] border border-white/80 bg-white/72 px-5 py-4 text-slate-900 outline-none focus:border-slate-300"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-[22px] border border-white/80 bg-white/72 px-5 py-4 text-slate-700 outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-[22px] border border-white/80 bg-white/72 px-5 py-4 text-slate-700 outline-none"
          >
            <option value="none">Sort By</option>
            <option value="low-high">Price: Low to High</option>
            <option value="high-low">Price: High to Low</option>
          </select>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-500">Loading products...</div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-slate-500">No products found.</div>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((product) => (
              <article
                key={product.id}
                className="rounded-[28px] border border-white/75 bg-white/82 p-3 shadow-[0_16px_34px_rgba(148,163,184,0.10),inset_0_1px_0_rgba(255,255,255,0.88)]"
              >
                <div className="relative overflow-hidden rounded-[24px] border border-slate-200/45 bg-linear-to-b from-white to-[#f3f4ef]">
                  <img src={getImageUrl(product.imageUrl)} alt={product.name} className="image-bleed h-60 w-full" />
                  <span className="absolute left-3 top-3 floating-chip px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-700">
                    {product.categoryName || "New"}
                  </span>
                  <button
                    onClick={() =>
                      isInWishlist(product.id) ? removeFromWishlist(product.id) : addToWishlist(product)
                    }
                    className="absolute right-3 top-3 soft-pill p-3 text-slate-700"
                    aria-label="Toggle wishlist"
                  >
                    <FaHeart size={14} className={isInWishlist(product.id) ? "text-[#ff8d49]" : "text-slate-500"} />
                  </button>
                </div>
                <div className="mt-3 border-t border-slate-200/70 p-2 pt-4">
                  <p className="card-metadata">{product.brand || "FitN"}</p>
                  <h3 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-slate-900">{product.name}</h3>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-slate-900">Rs {product.price}</p>
                      {product.discount > 0 && <p className="text-sm text-[#ff8d49]">{product.discount}% off</p>}
                    </div>
                    <button onClick={() => navigate(`/products/${product.id}`)} className="ghost-cta px-4 py-2 text-sm">
                      Details
                    </button>
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

export default Search;
