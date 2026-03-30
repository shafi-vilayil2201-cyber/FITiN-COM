import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { getAllProducts } from "../../services/api";
import { FaHeart } from "react-icons/fa";
import { WishlistContext } from "../../contexts/wishListContext";

const Search = () =>
{
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("none");
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const { addToWishlist, removeFromWishlist, wishList } = useContext(WishlistContext);
  const navigate = useNavigate();

  useEffect(() =>
  {
    const fetchProducts = async () =>
    {
      try
      {
        const res = await getAllProducts();
        setProducts(res);

        const uniqueCategories = [...new Set(res.map((p) => p.categoryName).filter(Boolean))];
        setCategories(uniqueCategories);
      } catch (error)
      {
        console.error("Error fetching products:", error);
      } finally
      {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() =>
  {
    let result = [...products];
    if (searchTerm)
    {
      result = result.filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (category !== "all")
    {
      result = result.filter((p) => p.categoryName === category);
    }
    if (sort === "low-high") result.sort((a, b) => a.price - b.price);
    else if (sort === "high-low") result.sort((a, b) => b.price - a.price);
    setFiltered(result);
  }, [searchTerm, category, sort, products]);

  return (
    <div className="max-w-7xl mx-auto px-4 pt-20 pb-10">
      <h1 className="text-3xl font-bold mb-8 text-center text-emerald-700">
        Discover Your Perfect Product
      </h1>

      <div className="flex flex-col md:flex-row gap-4 mb-8 justify-center bg-white shadow-md rounded-xl p-4">
        <input
          type="text"
          placeholder="🔍 Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          autoFocus
          className="border border-gray-300 px-4 py-2 rounded-md w-full md:w-1/3 focus:ring-2 focus:ring-emerald-500 outline-none"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border border-gray-300 px-4 py-2 rounded-md focus:ring-2 focus:ring-emerald-500"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="border border-gray-300 px-4 py-2 rounded-md focus:ring-2 focus:ring-emerald-500"
        >
          <option value="none">Sort By</option>
          <option value="low-high">Price: Low → High</option>
          <option value="high-low">Price: High → Low</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-gray-500 py-10">No products found.</p>
      ) : (
        <section className="w-full min-h-screen py-8 animate-fadeIn">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filtered.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition duration-300 transform hover:-translate-y-2 hover:scale-[1.02] flex flex-col overflow-hidden"
              >
                <div className="relative">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-56 object-cover rounded-t-2xl"
                  />
                  <span className="absolute top-3 left-3 bg-linear-to-r from-emerald-600 to-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">
                    {product.categoryName || "New"}
                  </span>
                  <button
                    onClick={() =>
                      wishList.some((item) => item.id === product.id)
                        ? removeFromWishlist(product.id)
                        : addToWishlist(product)
                    }
                    className="absolute top-3 right-3 transition-transform transform hover:scale-110"
                    aria-label="Toggle wishlist"
                  >
                    {wishList.some((item) => item.id === product.id) ? (
                      <FaHeart size={22} className="text-red-500" />
                    ) : (
                      <FaHeart size={22} className="text-gray-400" />
                    )}
                  </button>
                </div>

                <div className="p-5 flex flex-col grow justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-1 line-clamp-1">{product.name}</h3>
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                      {product.brand || "Popular product"} – {product.sport || "Sport"}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-auto">
                    <p className="text-lg font-semibold text-emerald-700">₹{product.price || "—"}</p>
                    <button
                      onClick={() => navigate(`/products/${product.id}`)}
                      className="px-5 py-2.5 bg-linear-to-r from-emerald-500 to-emerald-700 text-white text-sm font-semibold rounded-lg shadow hover:from-emerald-600 hover:to-emerald-800 transition-all duration-300 transform hover:scale-105"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Search;