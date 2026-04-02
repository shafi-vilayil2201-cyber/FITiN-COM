import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAllProducts } from "../../services/api.js";
import { CartContext } from "../../contexts/CartContext.jsx";
import { WishlistContext } from '../../contexts/wishListContext.jsx'
import "../../../src/App.css";

const ProductDetails = () => {
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
        const data = await getAllProducts();
        const product = data.find((item) => String(item.id) === id);
        setDetails(product);
      } catch (error) {
        console.error("Error fetching product details:", error);
      } finally {
        setPending(false);
      }
    };
    fetchProduct();
  }, [id]);


  if (pending) {
    return (
      <div className="flex justify-center items-center h-screen text-lg text-gray-600">
        Loading product details...
      </div>
    );
  }


  if (!details) {
    return (
      <div className="flex justify-center items-center h-screen text-lg text-red-500">
        Product not found!
      </div>
    );
  }


  return (
    <div className="min-h-screen flex justify-center items-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl flex flex-col md:flex-row w-full max-w-5xl overflow-hidden">

        <div className="md:w-1/2 flex justify-center items-center bg-linear-to-r from-yellow-600 via-yellow-400 to-yellow-600 p-6 animate-shimmer">
          <img
            src={details.imageUrl}
            alt={details.name}
            className="rounded-xl w-full h-80 object-cover shadow-2xl transition-transform duration-1000
            ease-[cubic-bezier(.13,.8,.5,1.2)] 
            hover:-translate-y-4 hover:scale-110 hover:-rotate-2
            focus:-translate-y-4 focus:scale-115 focus:-rotate-2
            outline-none z-1"
          />
        </div>

        <div className="md:w-1/2 p-8 flex flex-col justify-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {details.name}
          </h1>
          <h2 className="text-lg text-gray-600 mb-4">
            Brand: <span className="font-semibold">{details.brand}</span>
          </h2>
          <p className="text-gray-700 mb-4">{details.description}</p>
          <div className="text-2xl font-semibold text-emerald-600 mb-4">
            ₹{details.price}
          </div>
          <p className="text-yellow-500 font-medium mb-4">
            ⭐ {details.rating} / 5
          </p>

          <p className="text-gray-700 mb-2">
            {details.shortDescription}
          </p>
          <p className="text-gray-600 mb-4">{details.longDescription}</p>

          <div className="flex flex-wrap gap-4 mb-4 text-gray-700 text-sm">
            <p>
              <span className="font-semibold">Category:</span> {details.categoryName}
            </p>
            <p>
              <span className="font-semibold">Stock:</span> {details.stock}
            </p>
            <p>
              <span className="font-semibold">Discount:</span> {details.discount}%
            </p>
          </div>

          {details.specs && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold text-gray-800 mb-2">Specifications:</h3>
              <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                {details.specs.weight && <li>Weight: {details.specs.weight}</li>}
                {details.specs.material && <li>Material: {details.specs.material}</li>}
                {details.specs.headSize && <li>Head Size: {details.specs.headSize}</li>}
              </ul>
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={() => addToCart(details)}
              className={`px-6 py-2 rounded-lg transition duration-300 ${isInCart(details.id)
                ? "bg-gray-400 text-white cursor-default"
                : "bg-emerald-600 text-white hover:bg-emerald-700"
                }`}>
              {isInCart(details.id) ? "✓ In Cart" : "Add to Cart"}
            </button>
            <button
              onClick={() => navigate("/checkout", { state: { product: details } })}
              className="bg-cyan-600 text-white px-6 py-2 rounded-lg hover:bg-cyan-700"
            >
              Buy now
            </button>
            <button
              onClick={() => isInWishlist(details.id) ? removeFromWishlist(details.id) : addToWishlist(details)}
              className={`px-6 py-2 rounded-lg transition duration-300 ${isInWishlist(details.id)
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-purple-600 text-white hover:bg-purple-700"
                }`}>
              {isInWishlist(details.id) ? "♥ In Wishlist" : "Add to Wishlist"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;