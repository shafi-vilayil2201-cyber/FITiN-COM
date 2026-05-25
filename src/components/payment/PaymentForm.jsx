import React, { useContext, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaCheckCircle, FaCreditCard, FaLock, FaMobileAlt, FaUniversity } from "react-icons/fa";
import { CartContext } from "../../contexts/CartContext";
import { confirmPayment, createOrder } from "../../services/api";

const PaymentForm = () => {
  const [formData, setFormData] = useState({ name: "", address: "", city: "", postalCode: "", phone: "" });
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [showGateway, setShowGateway] = useState(false);
  const [gatewayStatus, setGatewayStatus] = useState("idle");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { cart, clearCart } = useContext(CartContext);

  const isDirectPurchase = !!location.state?.product;
  const directProduct = location.state?.product;

  const calculateDiscountedPrice = (price, discount) => (!discount || discount <= 0 ? price : price - (price * discount) / 100);

  const checkoutItems = isDirectPurchase
    ? [{ productId: directProduct.id, productName: directProduct.name, productPrice: directProduct.price, discount: directProduct.discount || 0, quantity: 1 }]
    : cart || [];

  const totals = checkoutItems.reduce(
    (acc, item) => {
      const originalPrice = item.productPrice || item.price || 0;
      const discountedPrice = calculateDiscountedPrice(originalPrice, item.discount || 0);
      const qty = item.quantity || 1;
      acc.original += originalPrice * qty;
      acc.discounted += discountedPrice * qty;
      return acc;
    },
    { original: 0, discounted: 0 }
  );

  const cartTotal = totals.discounted;
  const totalSavings = totals.original - totals.discounted;

  const validateShipping = () => {
    if (!formData.name || !formData.address || !formData.city || !formData.postalCode || !formData.phone) {
      toast.warning("Please fill all shipping fields.");
      return false;
    }
    return true;
  };

  const handleRazorpayPayment = async () => {
    if (!validateShipping()) return;
    setLoading(true);
    try {
      const items = isDirectPurchase
        ? [{ productId: directProduct.id, quantity: 1 }]
        : cart.map((item) => ({ productId: item.productId || item.id, quantity: item.quantity || 1 }));

      const orderData = await createOrder({
        shippingName: formData.name,
        shippingAddress: formData.address,
        shippingCity: formData.city,
        shippingPostalCode: formData.postalCode,
        shippingPhone: formData.phone,
        items,
      });

      const options = {
        key: "rzp_test_SpbpkO6f49yguG",
        amount: orderData.totalAmount * 100,
        currency: "INR",
        name: "FITiN",
        description: "Premium Fitness Gear",
        order_id: orderData.razorpayOrderId,
        handler: async function (response) {
          setGatewayStatus("processing");
          setShowGateway(true);

          try {
            const verification = await confirmPayment({
              orderId: orderData.orderId,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            });

            if (verification.isSuccess) {
              setGatewayStatus("success");
              if (!isDirectPurchase) await clearCart();
              toast.success("Order placed successfully.");
              setTimeout(() => navigate("/"), 2000);
            } else {
              toast.error(verification.message || "Payment verification failed.");
              setShowGateway(false);
            }
          } catch (error) {
            console.error("Verification error:", error);
            toast.error("Error verifying payment.");
            setShowGateway(false);
          }
        },
        prefill: { name: formData.name, contact: formData.phone },
        theme: { color: "#1d1f21" },
        modal: { ondismiss: function () { setLoading(false); } },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Payment initiation error:", error);
      toast.error(error.message || "Failed to initiate payment");
      setLoading(false);
    }
  };

  const paymentMethods = [
    { id: "upi", name: "UPI", icon: <FaMobileAlt />, desc: "GPay, PhonePe, Paytm" },
    { id: "card", name: "Cards", icon: <FaCreditCard />, desc: "Credit and debit cards" },
    { id: "netbanking", name: "Net banking", icon: <FaUniversity />, desc: "Most Indian banks" },
  ];

  const fieldClassName =
    "rounded-[22px] border border-slate-200/75 bg-white/88 px-5 py-4 text-slate-900 shadow-[0_10px_24px_rgba(148,163,184,0.08),inset_0_1px_0_rgba(255,255,255,0.92)] outline-none transition focus:border-slate-300 focus:bg-white focus:shadow-[0_14px_30px_rgba(148,163,184,0.12),inset_0_1px_0_rgba(255,255,255,0.94)]";

  return (
    <section className="px-3 py-8 md:px-6 md:py-12">
      <div className="section-shell grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="premium-card rounded-[36px] p-5 md:p-6">
          <div className="flex items-center gap-3">
            {[1, 2].map((step) => (
              <div key={step} className="flex items-center gap-3">
                <span className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${checkoutStep >= step ? "bg-slate-900 text-white" : "bg-white/70 text-slate-500"}`}>{step}</span>
                <span className="text-sm text-slate-600">{step === 1 ? "Shipping" : "Payment"}</span>
              </div>
            ))}
          </div>

          {checkoutStep === 1 ? (
            <div className="mt-8">
              <p className="section-kicker">Shipping details</p>
              <h1 className="section-title mt-4 text-slate-900">Soft forms, structured checkout.</h1>
              <div className="mt-6 grid gap-4">
                <input placeholder="Full name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={fieldClassName} />
                <textarea placeholder="Address" rows={4} value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className={`${fieldClassName} min-h-[9rem] resize-none`} />
                <div className="grid gap-4 md:grid-cols-2">
                  <input placeholder="City" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className={fieldClassName} />
                  <input placeholder="Postal code" value={formData.postalCode} onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })} className={fieldClassName} />
                </div>
                <input placeholder="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className={fieldClassName} />
              </div>
              <button onClick={() => validateShipping() && setCheckoutStep(2)} className="primary-cta mt-6 px-6 py-4 text-sm">
                Continue to payment
              </button>
            </div>
          ) : (
            <div className="mt-8">
              <p className="section-kicker">Payment method</p>
              <h1 className="section-title mt-4 text-slate-900">Choose how you want to pay.</h1>
              <div className="mt-6 grid gap-4">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`rounded-[24px] border p-5 text-left transition ${
                      paymentMethod === method.id
                        ? "border-slate-200/80 bg-white shadow-[0_18px_38px_rgba(148,163,184,0.12),inset_0_1px_0_rgba(255,255,255,0.94)]"
                        : "border-white/75 bg-white/76 shadow-[0_10px_24px_rgba(148,163,184,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="soft-pill p-3 text-slate-700">{method.icon}</span>
                        <div>
                          <p className="font-semibold text-slate-900">{method.name}</p>
                          <p className="text-sm text-slate-500">{method.desc}</p>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <button onClick={() => setCheckoutStep(1)} className="ghost-cta mt-5 px-5 py-3 text-sm">
                Edit shipping
              </button>
            </div>
          )}
        </div>

        <aside className="premium-card rounded-[36px] p-5 md:p-6">
          <p className="section-kicker">Order summary</p>
          <h2 className="section-title mt-4 text-slate-900">Checkout overview</h2>
          <div className="mt-6 grid gap-4">
            {checkoutItems.map((item) => {
              const originalPrice = item.productPrice || item.price || 0;
              const discountedPrice = calculateDiscountedPrice(originalPrice, item.discount || 0);
              return (
                <div key={item.productId} className="rounded-[24px] border border-slate-200/70 bg-white/82 p-4 shadow-[0_12px_28px_rgba(148,163,184,0.10),inset_0_1px_0_rgba(255,255,255,0.92)]">
                  <p className="font-semibold text-slate-900">{item.productName}</p>
                  <p className="mt-1 text-sm text-slate-500">Qty: {item.quantity}</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    Rs {(discountedPrice * item.quantity).toLocaleString("en-IN")}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-6 rounded-[28px] border border-slate-200/70 bg-white/82 p-5 shadow-[0_12px_28px_rgba(148,163,184,0.10),inset_0_1px_0_rgba(255,255,255,0.92)]">
            <div className="flex justify-between text-sm text-slate-600">
              <span>Subtotal</span>
              <span>Rs {totals.original.toLocaleString("en-IN")}</span>
            </div>
            {totalSavings > 0 && (
              <div className="mt-2 flex justify-between text-sm text-[#ff8d49]">
                <span>Savings</span>
                <span>- Rs {totalSavings.toLocaleString("en-IN")}</span>
              </div>
            )}
            <div className="mt-4 flex justify-between text-2xl font-semibold tracking-[-0.04em] text-slate-900">
              <span>Total</span>
              <span>Rs {cartTotal.toLocaleString("en-IN")}</span>
            </div>
          </div>

          {checkoutStep === 2 && (
            <button onClick={handleRazorpayPayment} disabled={loading} className="primary-cta mt-6 w-full px-6 py-4 text-sm disabled:opacity-60">
              {loading ? "Processing..." : `Pay Rs ${cartTotal.toLocaleString("en-IN")}`}
            </button>
          )}
          <p className="mt-4 flex items-center gap-2 text-sm text-slate-500"><FaLock /> Secure checkout</p>
        </aside>
      </div>

      {showGateway && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-md" />
          <div className="relative premium-card w-full max-w-md rounded-[34px] p-10 text-center">
            {gatewayStatus === "processing" ? (
              <>
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-900 text-white"><FaLock size={24} /></div>
                <h3 className="mt-6 text-3xl font-semibold tracking-[-0.05em] text-slate-900">Processing payment</h3>
                <p className="mt-3 text-slate-500">Please wait while we verify your transaction.</p>
              </>
            ) : (
              <>
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#a9dc63] text-slate-900"><FaCheckCircle size={28} /></div>
                <h3 className="mt-6 text-3xl font-semibold tracking-[-0.05em] text-slate-900">Payment successful</h3>
                <p className="mt-3 text-slate-500">Finalizing your order now.</p>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default PaymentForm;
