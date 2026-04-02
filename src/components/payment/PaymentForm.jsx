import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../../contexts/CartContext";
import { toast } from "react-toastify";
import { createOrder } from "../../services/api";
import { FaShoppingBag, FaMapMarkerAlt } from "react-icons/fa";

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

  const cartTotal = cart?.reduce((sum, item) => sum + (item.productPrice * item.quantity), 0) || 0;

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
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* Shipping Form */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
                  <FaMapMarkerAlt />
                </div>
                <h2 className="text-lg font-semibold text-slate-800">Shipping Details</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full border border-slate-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Shipping Address</label>
                  <textarea
                    name="address"
                    placeholder="Street, Building, Apartment..."
                    value={formData.address}
                    onChange={handleChange}
                    rows={2}
                    className="w-full border border-slate-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                    <input
                      type="text"
                      name="city"
                      placeholder="Mumbai"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full border border-slate-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Postal Code</label>
                    <input
                      type="text"
                      name="postalCode"
                      placeholder="400001"
                      value={formData.postalCode}
                      onChange={handleChange}
                      className="w-full border border-slate-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full border border-slate-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sticky top-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
                  <FaShoppingBag />
                </div>
                <h2 className="text-lg font-semibold text-slate-800">Order Summary</h2>
              </div>

              {cart && cart.length > 0 ? (
                <>
                  <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                    {cart.map((item) => (
                      <div key={item.productId} className="flex justify-between items-center text-sm py-2 border-b border-slate-50 last:border-0">
                        <div className="flex-1">
                          <p className="font-medium text-slate-700 line-clamp-1">{item.productName}</p>
                          <p className="text-xs text-slate-400">Qty: {item.quantity}</p>
                        </div>
                        <span className="font-medium text-slate-700 ml-4">
                          ₹{(item.productPrice * item.quantity).toLocaleString("en-IN")}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-slate-200 pt-4 space-y-2">
                    <div className="flex justify-between text-sm text-slate-500">
                      <span>Subtotal</span>
                      <span>₹{cartTotal.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between text-sm text-slate-500">
                      <span>Shipping</span>
                      <span className="text-emerald-600 font-medium">Free</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-slate-900 pt-2 border-t border-slate-200">
                      <span>Total</span>
                      <span className="text-emerald-600">₹{cartTotal.toLocaleString("en-IN")}</span>
                    </div>
                  </div>

                  <button
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="w-full mt-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 disabled:bg-gray-400 transition-colors shadow-lg shadow-emerald-600/20"
                  >
                    {loading ? "Placing Order..." : `Place Order — ₹${cartTotal.toLocaleString("en-IN")}`}
                  </button>
                </>
              ) : (
                <p className="text-slate-400 text-sm text-center py-8">Your cart is empty</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PaymentForm;
