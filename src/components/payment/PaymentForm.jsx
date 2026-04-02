import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../../contexts/CartContext";
import { toast } from "react-toastify";
import { createOrder } from "../../services/api";

const PaymentForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    postalCode: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { cart, clearCart } = useContext(CartContext);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async () => {
    if (!formData.name || !formData.address || !formData.city || !formData.postalCode || !formData.phone) {
      toast.warning("Please fill all the fields!");
      return;
    }

    if (!cart || cart.length === 0) {
      toast.warning("Your cart is empty!");
      return;
    }

    setLoading(true);
    try {
      await createOrder({
        shippingName: formData.name,
        shippingAddress: formData.address,
        shippingCity: formData.city,
        shippingPostalCode: formData.postalCode,
        shippingPhone: formData.phone,
      });
      await clearCart();
      toast.success("Order placed successfully!");
      navigate("/");
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("Something went wrong while placing the order.");
    } finally {
      setLoading(false);
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
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 disabled:bg-gray-400"
          >
            {loading ? "Placing Order..." : "Place Order"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentForm;
