import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { CartContext } from "../../contexts/CartContext";
import { toast } from "react-toastify";

/* Environment-based backend URL */
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

const PaymentForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    postalCode: "",
    phone: "",
  });

  const navigate = useNavigate();
  const location = useLocation();

  const productFromBuyNow = location.state?.product;
  const { cart, clearCart } = useContext(CartContext);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async () => {
    if (!formData.name || !formData.address || !formData.city || !formData.postalCode || !formData.phone) {
      toast.warning("Please fill all the fields!");
      return;
    }

    const stored = localStorage.getItem("user") || localStorage.getItem("currentUser");
    const loggedUser = stored ? JSON.parse(stored) : null;

    if (!loggedUser) {
      toast.info("Please log in before placing an order.");
      return;
    }

    try {
      // Load full user data from backend (fallback to local stored user)
      let userData;
      try {
        const resp = await axios.get(`${API_BASE}/users/${loggedUser.id}`);
        userData = resp.data;
      } catch (e) {
        userData = loggedUser;
      }

      // Build items (either Buy Now or Cart)
      let items = [];
      if (productFromBuyNow) {
        items = [
          {
            productId: productFromBuyNow.id,
            name: productFromBuyNow.name,
            price: productFromBuyNow.price,
            quantity: productFromBuyNow.quantity || 1,
          },
        ];
      } else {
        if (!cart || cart.length === 0) {
          toast.warning("Your cart is empty!");
          return;
        }
        items = cart.map((item) => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity || 1,
        }));
      }

      const newOrder = {
        id: Date.now(),
        userId: String(loggedUser.id),
        items,
        totalAmount: items.reduce((sum, it) => sum + (it.price || 0) * (it.quantity || 1), 0),
        shippingDetails: formData,
        orderDate: new Date().toISOString(),
        status: "Pending",
      };

      // Create order in /orders
      try {
        await axios.post(`${API_BASE}/orders`, newOrder);
      } catch (err) {
        console.warn("Warning: could not POST to /orders:", err.message || err);
      }

      // Update user's order history
      try {
        const updatedOrders = [...(userData.orders || []), newOrder];
        await axios.patch(`${API_BASE}/users/${loggedUser.id}`, {
          orders: updatedOrders,
        });
      } catch (err) {
        console.warn("Warning: could not update user.orders:", err.message || err);
      }

      if (!productFromBuyNow && clearCart) clearCart();

      toast.success("Order placed successfully!");
      navigate("/");
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("Something went wrong while placing the order.");
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-emerald-700">Checkout</h1>

        <div className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
          <textarea
            name="address"
            placeholder="Shipping Address"
            value={formData.address}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
          <input
            type="text"
            name="city"
            placeholder="City"
            value={formData.city}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
          <input
            type="text"
            name="postalCode"
            placeholder="Postal Code"
            value={formData.postalCode}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />

          <button
            onClick={handlePlaceOrder}
            className="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700"
          >
            Place Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentForm;