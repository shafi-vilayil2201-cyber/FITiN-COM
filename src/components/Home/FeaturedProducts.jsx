import React, { useEffect, useState } from "react";
import { getAllProducts } from "../../services/api.js";
import { useNavigate } from "react-router-dom";

const FeaturedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await getAllProducts();
        setProducts(response);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center text-gray-600 text-xl">
        Loading products...
      </div>
    );
  }


  const handleBuyNow = (productId) => {
    navigate(`/products/${productId}`);
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Featured Products
        </h1>
        <p className="text-gray-500">
          Discover our best-selling fitness essentials
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-6">

        {products.slice(0, 6).map((product) => (
          <div
            key={product.id}
            className="bg-white shadow-md rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300"
          >
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-56 w-full object-cover"
            />
            <div className="p-5 text-center">
              <h2 className="text-lg font-semibold text-gray-800">
                {product.name}
              </h2>
              <p className="text-gray-500 mt-1">
                Rs {product.price || "N/A"}
              </p>

              <button
                onClick={() => handleBuyNow(product.id)}
                className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
              >
                Buy Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturedProducts;