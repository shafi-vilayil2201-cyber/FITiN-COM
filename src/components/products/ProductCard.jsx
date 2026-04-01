import React, { useEffect, useState, useContext } from "react";
import { getAllProducts } from "../../services/api";
import { useNavigate } from "react-router-dom";
import Search from "./Search";
import { WishlistContext } from "../../contexts/wishListContext";
import { CartContext } from "../../contexts/CartContext";
import { FaHeart, FaRegHeart, FaShoppingCart } from "react-icons/fa"; // Added 's'

const ProductCard = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Contexts
    const { addToWishlist, removeFromWishlist, isInWishlist } = useContext(WishlistContext);
    const { addToCart } = useContext(CartContext);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await getAllProducts();
                setProducts(data);
            } catch (error) {
                console.error("Error fetching products:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    // Helper for Wishlist Toggle
    const handleWishlistToggle = (e, product) => {
        e.stopPropagation();
        if (isInWishlist(product.id)) {
            removeFromWishlist(product.id);
        } else {
            addToWishlist(product);
        }
    };

    // Helper for Add to Cart
    const handleAddToCart = (e, product) => {
        e.stopPropagation();
        addToCart(product);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen text-xl font-semibold text-gray-700 animate-pulse">
                Loading products...
            </div>
        );
    }

    return (
        <>
            <Search />
            <section className="w-full min-h-screen bg-linear-to-br from-gray-0 via-50% to-gray-100 py-12 px-6">
                <div className="flex justify-center mb-10">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800 text-center">
                        All Products
                    </h1>
                </div>

                <div className="flex justify-center">
                    <div className="max-w-7xl w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-8">
                        {products.map((product) => (
                            <div
                                key={product.id}
                                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition duration-300 transform hover:-translate-y-2 flex flex-col overflow-hidden relative group cursor-pointer"
                                onClick={() => navigate(`/products/${product.id}`)}
                            >
                                {/* Wishlist Button */}
                                <button
                                    onClick={(e) => handleWishlistToggle(e, product)}
                                    className="absolute top-3 right-3 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:scale-110 transition-transform duration-200"
                                >
                                    {isInWishlist(product.id) ? (
                                        <FaHeart className="text-red-500 text-xl" />
                                    ) : (
                                        <FaRegHeart className="text-gray-400 hover:text-red-400 text-xl" />
                                    )}
                                </button>

                                <div className="relative">
                                    <img
                                        src={product.imageUrl}
                                        alt={product.name}
                                        className="w-full h-52 object-cover rounded-t-2xl"
                                    />
                                    <span className="absolute top-3 left-3 bg-emerald-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">
                                        {product.categoryName || "New"}
                                    </span>
                                </div>

                                <div className="p-5 flex flex-col grow justify-between">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-800 mb-1 line-clamp-1">
                                            {product.name}
                                        </h3>
                                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                            {product.brand || "Popular product"} – {product.sport || "Sport"}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between mt-auto gap-2">
                                        <p className="text-lg font-semibold text-emerald-700">
                                            ₹{product.price || "—"}
                                        </p>

                                        {/* Add to Cart Button */}
                                        <button
                                            onClick={(e) => handleAddToCart(e, product)}
                                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg flex items-center gap-2 hover:bg-emerald-700 transition"
                                        >
                                            <FaShoppingCart />
                                        </button>

                                        <button
                                            className="px-4 py-2 border border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50 transition text-sm font-medium"
                                        >
                                            Details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
};

export default ProductCard;
