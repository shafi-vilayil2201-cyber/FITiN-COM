import React, { useState, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CartContext } from "../../contexts/CartContext";
import { toast } from "react-toastify";
import { createOrder, confirmPayment } from "../../services/api";
import {
  FaShoppingBag,
  FaMapMarkerAlt,
  FaCreditCard,
  FaUniversity,
  FaMobileAlt,
  FaCheckCircle,
  FaLock,
  FaArrowRight,
  FaTimes
} from "react-icons/fa";

const PaymentForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    postalCode: "",
    phone: "",
  });
  const [checkoutStep, setCheckoutStep] = useState(1); // 1: Shipping, 2: Payment
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [showGateway, setShowGateway] = useState(false);
  const [gatewayStatus, setGatewayStatus] = useState("idle"); // idle, processing, success
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { cart, clearCart } = useContext(CartContext);

  // Check if we are in "Direct Purchase" mode (from a 'Buy Now' button)
  const isDirectPurchase = !!location.state?.product;
  const directProduct = location.state?.product;

  const calculateDiscountedPrice = (price, discount) => {
    if (!discount || discount <= 0) return price;
    return price - (price * discount) / 100;
  };

  const checkoutItems = isDirectPurchase
    ? [{
      productId: directProduct.id,
      productName: directProduct.name,
      productPrice: directProduct.price,
      discount: directProduct.discount || 0,
      quantity: 1,
      imageUrl: directProduct.imageUrl
    }]
    : (cart || []);

  const totals = checkoutItems.reduce((acc, item) => {
    const originalPrice = (item.productPrice || item.price || 0);
    const discount = (item.discount || 0);
    const discountedPrice = calculateDiscountedPrice(originalPrice, discount);
    const qty = (item.quantity || 1);

    acc.original += originalPrice * qty;
    acc.discounted += discountedPrice * qty;
    return acc;
  }, { original: 0, discounted: 0 });

  const cartTotal = totals.discounted;
  const totalSavings = totals.original - totals.discounted;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNextStep = () => {
    if (!formData.name || !formData.address || !formData.city || !formData.postalCode || !formData.phone) {
      toast.warning("Please fill all the shipping fields!");
      return;
    }
    setCheckoutStep(2);
    window.scrollTo(0, 0);
  };

  const handleRazorpayPayment = async () => {
    if (!formData.name || !formData.address || !formData.city || !formData.postalCode || !formData.phone) {
      toast.warning("Please fill all shipping fields!");
      return;
    }

    setLoading(true);
    try {
      // 1. Create Order on Backend (Returns Razorpay Order ID)
      const items = isDirectPurchase
        ? [{ productId: directProduct.id, quantity: 1 }]
        : cart.map(item => ({
          productId: item.productId || item.id,
          quantity: item.quantity || 1
        }));

      const orderResponse = await createOrder({
        shippingName: formData.name,
        shippingAddress: formData.address,
        shippingCity: formData.city,
        shippingPostalCode: formData.postalCode,
        shippingPhone: formData.phone,
        items: items
      });

      const orderData = orderResponse; // Based on BaseApiController structure
      const razorpayOrderId = orderData.razorpayOrderId;

      // 2. Open Razorpay Modal
      const options = {
        key: "rzp_test_SpbpkO6f49yguG", // This should ideally come from backend or env
        amount: orderData.totalAmount * 100,
        currency: "INR",
        name: "FITiN",
        description: "Premium Fitness Gear",
        order_id: razorpayOrderId,
        handler: async function (response) {
          // 3. Verify Payment on Backend
          setGatewayStatus("processing");
          setShowGateway(true);

          try {
            const verification = await confirmPayment({
              orderId: orderData.orderId,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature
            });

            if (verification.isSuccess) {
              setGatewayStatus("success");
              if (!isDirectPurchase) await clearCart();
              toast.success("Order Placed Successfully!");
              setTimeout(() => {
                navigate("/");
              }, 2000);
            } else {
              toast.error(verification.message || "Payment Verification Failed!");
              setShowGateway(false);
            }
          } catch (err) {
            console.error("Verification error:", err);
            toast.error("Error verifying payment.");
            setShowGateway(false);
          }
        },
        prefill: {
          name: formData.name,
          contact: formData.phone
        },
        theme: {
          color: "#059669"
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error("Payment initiation error:", error);
      toast.error(error.message || "Failed to initiate payment");
      setLoading(false);
    }
  };

  const paymentMethods = [
    { id: "upi", name: "UPI (GPay, PhonePe)", icon: <FaMobileAlt />, desc: "Pay using any BHIM UPI app" },
    { id: "card", name: "Cards (Credit/Debit)", icon: <FaCreditCard />, desc: "Visa, Mastercard, RuPay" },
    { id: "netbanking", name: "Net Banking", icon: <FaUniversity />, desc: "Most Indian Banks" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-10 flex items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${checkoutStep >= 1 ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-slate-200 text-slate-500'}`}>1</span>
            <span className={`font-bold text-sm ${checkoutStep >= 1 ? 'text-emerald-700' : 'text-slate-400'}`}>Shipping</span>
          </div>
          <div className={`h-0.5 w-12 transition-all ${checkoutStep >= 2 ? 'bg-emerald-600' : 'bg-slate-200'}`} />
          <div className="flex items-center gap-2">
            <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${checkoutStep >= 2 ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-slate-200 text-slate-500'}`}>2</span>
            <span className={`font-bold text-sm ${checkoutStep >= 2 ? 'text-emerald-700' : 'text-slate-400'}`}>Payment</span>
          </div>
        </div>

        <h1 className="text-3xl font-black text-slate-900 mb-8 tracking-tight">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Main Form Area */}
          <div className="lg:col-span-3 space-y-6">
            {checkoutStep === 1 ? (
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 animate-in fade-in slide-in-from-left-4 duration-500">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100">
                    <FaMapMarkerAlt />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900">Shipping Details</h2>
                    <p className="text-slate-400 text-sm font-medium">Where should we send your gear?</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      placeholder="e.g. John Doe"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-100 px-5 py-3.5 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold text-slate-800"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Shipping Address</label>
                    <textarea
                      name="address"
                      placeholder="Street, Building, Apartment..."
                      value={formData.address}
                      onChange={handleChange}
                      rows={3}
                      className="w-full bg-slate-50 border border-slate-100 px-5 py-3.5 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold text-slate-800 resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">City</label>
                      <input
                        type="text"
                        name="city"
                        placeholder="e.g. Mumbai"
                        value={formData.city}
                        onChange={handleChange}
                        className="w-full bg-slate-50 border border-slate-100 px-5 py-3.5 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold text-slate-800"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Postal Code</label>
                      <input
                        type="text"
                        name="postalCode"
                        placeholder="400001"
                        value={formData.postalCode}
                        onChange={handleChange}
                        className="w-full bg-slate-50 border border-slate-100 px-5 py-3.5 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold text-slate-800"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-100 px-5 py-3.5 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold text-slate-800"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100">
                    <FaCreditCard />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900">Payment Method</h2>
                    <p className="text-slate-400 text-sm font-medium">Choose how you'd like to pay</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`w-full flex items-center gap-4 p-5 rounded-2xl border-2 transition-all text-left ${paymentMethod === method.id ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-50 bg-slate-50/50 hover:border-slate-200'}`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${paymentMethod === method.id ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-white text-slate-400 shadow-sm'}`}>
                        {method.icon}
                      </div>
                      <div className="flex-1">
                        <p className={`font-black ${paymentMethod === method.id ? 'text-emerald-900' : 'text-slate-700'}`}>{method.name}</p>
                        <p className="text-xs text-slate-400 font-medium">{method.desc}</p>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${paymentMethod === method.id ? 'border-emerald-500 bg-emerald-500' : 'border-slate-200'}`}>
                        {paymentMethod === method.id && <div className="w-2 h-2 bg-white rounded-full shadow-sm" />}
                      </div>
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCheckoutStep(1)}
                  className="mt-6 text-sm font-black text-slate-400 hover:text-emerald-600 transition-colors uppercase tracking-widest pl-2"
                >
                  ← Edit Shipping Info
                </button>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 sticky top-24">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100">
                  <FaShoppingBag />
                </div>
                <h2 className="text-xl font-black text-slate-900">Order Summary</h2>
              </div>

              {checkoutItems.length > 0 ? (
                <>
                  <div className="space-y-4 max-h-64 overflow-y-auto mb-6 pr-2 custom-scrollbar">
                    {checkoutItems.map((item) => {
                      const originalPrice = (item.productPrice || item.price || 0);
                      const discountedPrice = calculateDiscountedPrice(originalPrice, item.discount || 0);
                      return (
                        <div key={item.productId} className="flex justify-between items-center text-sm py-1">
                          <div className="flex-1 min-w-0 pr-4">
                            <p className="font-bold text-slate-900 truncate">{item.productName}</p>
                            <p className="text-[10px] text-slate-400 font-black uppercase">Qty: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <span className="font-black text-slate-900 block">
                              ₹{(discountedPrice * item.quantity).toLocaleString("en-IN")}
                            </span>
                            {item.discount > 0 && (
                              <span className="text-[10px] text-slate-400 line-through">
                                ₹{(originalPrice * item.quantity).toLocaleString("en-IN")}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t border-slate-100 pt-6 space-y-3">
                    <div className="flex justify-between text-sm font-bold text-slate-500">
                      <span>Subtotal</span>
                      <span>₹{totals.original.toLocaleString("en-IN")}</span>
                    </div>
                    {totalSavings > 0 && (
                      <div className="flex justify-between text-sm font-bold text-rose-500 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-100 items-baseline">
                        <span className="text-[10px] uppercase tracking-widest font-black">Discount Savings</span>
                        <span className="font-black">-₹{totalSavings.toLocaleString("en-IN")}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-bold text-slate-500">
                      <span>Shipping</span>
                      <span className="text-emerald-600 uppercase tracking-widest text-[10px]">Free</span>
                    </div>
                    <div className="flex justify-between text-2xl font-black text-slate-900 pt-4 border-t border-slate-100 mt-4">
                      <span>Total</span>
                      <span className="text-emerald-600">₹{cartTotal.toLocaleString("en-IN")}</span>
                    </div>
                  </div>

                  {checkoutStep === 1 ? (
                    <button
                      onClick={handleNextStep}
                      className="w-full mt-8 py-5 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3 group"
                    >
                      <span>Proceed to Payment</span>
                      <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  ) : (
                    <button
                      onClick={handleRazorpayPayment}
                      disabled={loading}
                      className="w-full mt-8 py-5 bg-emerald-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <FaLock className="text-xs" />
                          <span>Pay ₹{cartTotal.toLocaleString("en-IN")}</span>
                        </>
                      )}
                    </button>
                  )}

                  <p className="mt-4 text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                    <FaLock /> Secure SSL Encrypted
                  </p>
                </>
              ) : (
                <div className="py-12 text-center">
                  <p className="text-slate-400 font-medium italic">Your cart is empty</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Simulated Payment Gateway (Razorpay Mockup) */}
      {showGateway && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
          <div className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col items-center p-10 text-center animate-in zoom-in-95 duration-300">
            {gatewayStatus === "processing" ? (
              <div className="space-y-8 py-6">
                <div className="relative w-24 h-24 mx-auto">
                  <div className="absolute inset-0 border-4 border-emerald-100 rounded-full" />
                  <div className="absolute inset-0 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center text-emerald-600">
                    <FaLock size={24} />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2">Processing Payment</h3>
                  <p className="text-slate-400 font-medium">Please do not refresh the page or close the window.</p>
                </div>
                <div className="pt-4 border-t border-slate-50 flex items-center justify-center gap-8">
                  <img src="https://razorpay.com/assets/razorpay-glyph.svg" alt="Razorpay" className="h-6 opacity-30 grayscale" />
                  <div className="h-4 w-px bg-slate-100" />
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Securing your transaction</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6 py-6 animate-in zoom-in-95 duration-500">
                <div className="w-24 h-24 bg-emerald-500 rounded-full mx-auto flex items-center justify-center text-white text-4xl shadow-xl shadow-emerald-500/20">
                  <FaCheckCircle />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-slate-900 mb-2">Payment Successful!</h3>
                  <p className="text-emerald-600 font-bold">Transaction ID: #FTN_{Math.random().toString(36).substring(7).toUpperCase()}</p>
                </div>
                <p className="text-slate-400 font-medium">Finalizing your order at FITiN. Hang tight!</p>
              </div>
            )}

            {gatewayStatus === "processing" && (
              <button
                onClick={() => setShowGateway(false)}
                className="mt-8 text-slate-300 hover:text-rose-500 transition-colors text-xs font-black uppercase tracking-widest"
              >
                Cancel Transaction
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentForm;
