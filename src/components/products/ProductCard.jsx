import React, { useEffect, useState } from "react";
import { getAllProducts } from "../../services/api";
import { useNavigate } from "react-router-dom";
import Search from "./Search";
const ProductCard = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

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
            <section className="w-full min-h-screen bg-linear-to-br from-gray-0 via-50% to-gray-100 py-12 px-6 ">

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
                                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition duration-300 transform hover:-translate-y-2 flex flex-col overflow-hidden"
                            >
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

                                    <div className="flex items-center justify-between mt-auto">
                                        <p className="text-lg font-semibold text-emerald-700">
                                            ₹{product.price || "—"}
                                        </p>
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
                </div>
            </section>
        </>
    );
};

export default ProductCard;
