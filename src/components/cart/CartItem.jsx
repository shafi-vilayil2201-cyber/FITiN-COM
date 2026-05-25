import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { CartContext } from "../../contexts/CartContext";
import { IMAGE_BASE_URL } from "../../services/api";

const getImageUrl = (value) => {
  if (!value) return "https://via.placeholder.com/100";
  return value.startsWith("http") ? value.replace(":7071", ":5252") : `${IMAGE_BASE_URL}${value}`;
};

const CartItem = () => {
  const { cart, removeFromCart, increaseQty, decreaseQty } = useContext(CartContext);
  const navigate = useNavigate();

  if (!cart || cart.length === 0) return <div className="py-20 text-center text-slate-500">Your cart is empty.</div>;

  const discountedPrice = (price, discount) => (!discount || discount <= 0 ? price : price - (price * discount) / 100);
  const totalPrice = cart.reduce((acc, item) => acc + discountedPrice(item.productPrice || 0, item.discount || 0) * (item.quantity || 1), 0);

  return (
    <section className="px-3 py-8 md:px-6 md:py-12">
      <div className="section-shell grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="premium-card rounded-[36px] p-5 md:p-6">
          <p className="section-kicker">Cart review</p>
          <h1 className="section-title mt-4 text-slate-900">A softer, clearer summary of selected items.</h1>

          <div className="mt-8 grid gap-4">
            {cart.map((item) => {
              const finalPrice = discountedPrice(item.productPrice || 0, item.discount || 0);
              return (
                <article key={item.productId} className="rounded-[28px] bg-white/72 p-4 md:p-5">
                  <div className="grid gap-4 md:grid-cols-[120px_1fr_auto] md:items-center">
                    <img src={getImageUrl(item.productImageUrl)} alt={item.productName} className="image-bleed h-28 w-full rounded-[22px] md:w-28" />
                    <div>
                      <h2 className="text-2xl font-semibold tracking-[-0.04em] text-slate-900">{item.productName}</h2>
                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <p className="text-lg font-semibold text-slate-900">Rs {finalPrice.toLocaleString("en-IN")}</p>
                        {item.discount > 0 && <span className="rounded-full bg-[#ffefe3] px-3 py-1 text-xs font-semibold text-[#ff8d49]">-{item.discount}%</span>}
                      </div>
                      <div className="mt-4 flex items-center gap-2">
                        <button onClick={() => decreaseQty(item.productId)} className="soft-pill px-3 py-2 text-slate-700">-</button>
                        <span className="min-w-8 text-center font-semibold text-slate-900">{item.quantity}</span>
                        <button onClick={() => increaseQty(item.productId)} className="soft-pill px-3 py-2 text-slate-700">+</button>
                      </div>
                    </div>
                    <div className="flex gap-2 md:flex-col md:items-end">
                      <p className="text-lg font-semibold text-slate-900">Rs {(finalPrice * (item.quantity || 1)).toLocaleString("en-IN")}</p>
                      <button onClick={() => removeFromCart(item.productId)} className="text-sm text-slate-500">Remove</button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <aside className="premium-card rounded-[36px] p-5 md:p-6">
          <p className="section-kicker">Summary</p>
          <h2 className="section-title mt-4 text-slate-900">Order total</h2>
          <div className="mt-8 rounded-[28px] bg-white/72 p-5">
            <p className="card-metadata">Estimated total</p>
            <p className="mt-3 text-4xl font-semibold tracking-[-0.06em] text-slate-900">
              Rs {totalPrice.toLocaleString("en-IN")}
            </p>
          </div>
          <button
            onClick={() => {
              toast.success("Proceeding to checkout");
              navigate("/checkout");
            }}
            className="primary-cta mt-6 w-full px-5 py-4 text-sm"
          >
            Proceed to checkout
          </button>
        </aside>
      </div>
    </section>
  );
};

export default CartItem;
