import React, { useContext } from "react";
import { CartContext } from "../../contexts/CartContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { IMAGE_BASE_URL } from "../../services/api";

const CartItem = () => {
  const { cart, removeFromCart, increaseQty, decreaseQty } = useContext(CartContext);
  const navigate = useNavigate();

  if (!cart || cart.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen text-lg text-gray-600">
        Your cart is empty
      </div>
    );
  }

  const calculateDiscountedPrice = (price, discount) => {
    if (!discount || discount <= 0) return price;
    return price - (price * discount) / 100;
  };

  const totalPrice = cart.reduce(
    (acc, item) => {
      const price = calculateDiscountedPrice(item.productPrice || 0, item.discount || 0);
      return acc + price * (item.quantity || 1);
    }, 0
  );

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-3xl font-bold mb-6 text-emerald-700">Your Cart</h1>

      <div className="space-y-6">
        {cart.map((item) => {
          const discountedPrice = calculateDiscountedPrice(item.productPrice || 0, item.discount || 0);
          const hasDiscount = item.discount > 0;

          return (
            <div
              key={item.productId}
              className="flex items-center justify-between border-b pb-4"
            >
              <div className="flex items-center gap-4">
                <img
                  src={item.productImageUrl ? (item.productImageUrl.startsWith('http') ? item.productImageUrl.replace(':7071', ':5252') : `${IMAGE_BASE_URL}${item.productImageUrl}`) : "https://via.placeholder.com/100"}
                  alt={item.productName}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div>
                  <h2 className="text-lg font-semibold">{item.productName}</h2>
                  <div className="flex items-center gap-2">
                    {hasDiscount ? (
                      <>
                        <p className="text-emerald-600 font-bold">₹{discountedPrice.toLocaleString("en-IN")}</p>
                        <p className="text-gray-400 text-sm line-through decoration-rose-500/50">₹{item.productPrice}</p>
                        <span className="bg-rose-50 text-rose-600 text-[10px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter">-{item.discount}%</span>
                      </>
                    ) : (
                      <p className="text-gray-500 text-sm font-medium">₹{item.productPrice}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => decreaseQty(item.productId)}
                      className="bg-gray-100 w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors font-bold text-slate-600"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-bold text-slate-800">{item.quantity}</span>
                    <button
                      onClick={() => increaseQty(item.productId)}
                      className="bg-gray-100 w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors font-bold text-slate-600"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end">
                <p className="font-black text-slate-900 text-lg">
                  ₹{(discountedPrice * (item.quantity || 1)).toLocaleString("en-IN")}
                </p>
                <button
                  onClick={() => removeFromCart(item.productId)}
                  className="text-rose-500 hover:text-rose-700 mt-2 text-xs font-black uppercase tracking-widest transition-colors flex items-center gap-1"
                >
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-12 bg-slate-50 rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Estimated Total</p>
          <h2 className="text-4xl font-black text-slate-900">
            ₹{totalPrice.toLocaleString("en-IN")}
          </h2>
        </div>
        <button
          onClick={() => { toast.success("Proceeding to checkout"); navigate("/checkout"); }}
          className="bg-slate-900 text-white px-10 py-5 rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 font-black uppercase tracking-widest text-sm flex items-center gap-3 group"
        >
          <span>Proceed to Checkout</span>
          <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center group-hover:translate-x-1 transition-transform">
            →
          </div>
        </button>
      </div>
    </div>
  );
};

export default CartItem;
