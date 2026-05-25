import React from "react";
import { useNavigate } from "react-router-dom";
import { IMAGE_BASE_URL } from "../../services/api.js";

const getImageUrl = (value) => {
  if (!value) {
    return "https://images.unsplash.com/photo-1571019613540-99684f0a1f4d?auto=format&fit=crop&w=1200&q=80";
  }
  return value.startsWith("http") ? value.replace(":7071", ":5252") : `${IMAGE_BASE_URL}${value}`;
};

const FeaturedProducts = ({ products = [], loading }) => {
  const navigate = useNavigate();

  if (loading) {
    return <div className="py-16 text-center text-slate-500">Loading featured products...</div>;
  }

  return (
    <section className="px-3 py-10 md:px-6 md:py-14">
      <div className="section-shell">
        <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="section-kicker">Trending now</p>
            <h2 className="section-title mt-4 text-slate-900">Dynamic product cards with quieter luxury.</h2>
            <p className="body-copy mt-4 max-w-2xl">
              Cards support dynamic titles, pricing, discounts, badges, and actions without breaking the layout.
            </p>
          </div>
          <div className="soft-pill px-4 py-2 text-sm font-medium text-slate-600">Designed for API variability</div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {products.slice(0, 6).map((product, index) => {
            const hasDiscount = Number(product.discount) > 0;
            const finalPrice = hasDiscount
              ? product.price - (product.price * product.discount) / 100
              : product.price;

            return (
              <article key={product.id} className="premium-card group overflow-hidden rounded-[34px] p-3">
                <div className="relative overflow-hidden rounded-[28px]">
                  <img
                    src={getImageUrl(product.imageUrl)}
                    alt={product.name}
                    className="image-bleed h-72 w-full transition duration-300 group-hover:scale-[1.03]"
                  />
                  <div className="absolute left-4 top-4 flex items-center gap-2">
                    <span className="floating-chip px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-700">
                      Pick {String(index + 1).padStart(2, "0")}
                    </span>
                    {hasDiscount && (
                      <span className="rounded-full bg-[#ff8d49] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white">
                        {product.discount}% off
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-3 md:p-4">
                  <p className="card-metadata">
                    {product.brand || "FitN"} {product.categoryName ? `· ${product.categoryName}` : ""}
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-[-0.045em] text-slate-900">
                    {product.name}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    Backend-driven content flows into a more editorial card structure with stronger spacing and softer emphasis.
                  </p>

                  <div className="mt-5 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-xl font-semibold tracking-[-0.04em] text-slate-900">
                        Rs {Number(finalPrice ?? 0).toLocaleString("en-IN")}
                      </p>
                      {hasDiscount && (
                        <p className="mt-1 text-sm text-slate-400 line-through">
                          Rs {Number(product.price ?? 0).toLocaleString("en-IN")}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => navigate(`/products/${product.id}`)} className="ghost-cta px-4 py-2 text-sm">
                        Details
                      </button>
                      <button onClick={() => navigate("/checkout", { state: { product } })} className="primary-cta px-4 py-2 text-sm">
                        Buy
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
