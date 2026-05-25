import React from "react";
import { IMAGE_BASE_URL } from "../../services/api";

const getImageUrl = (value) => {
  if (!value) {
    return "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=80";
  }
  return value.startsWith("http") ? value : `${IMAGE_BASE_URL}${value}`;
};

const Recommendations = ({ products = [], loading }) => {
  const items = products.slice(1, 5);

  if (loading) return null;

  return (
    <section className="px-3 py-10 md:px-6 md:py-14">
      <div className="section-shell grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="premium-card rounded-[34px] p-6 md:p-8">
          <p className="section-kicker">Recommendations</p>
          <h2 className="section-title mt-4 text-slate-900">Personalized blocks, calmer spacing, stronger hierarchy.</h2>
          <p className="body-copy mt-5">
            Recommendations should feel like curated advice, not a crowded feed. These cards stay soft, roomy,
            and adaptable to changing product names, prices, and badge states.
          </p>
          <div className="mt-8 grid gap-3">
            {[
              "Reusable card primitives",
              "Low-contrast elevated surfaces",
              "Dynamic content-safe layouts",
            ].map((item) => (
              <div key={item} className="soft-pill px-4 py-3 text-sm font-medium text-slate-700">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((product) => (
            <article key={product.id} className="premium-card overflow-hidden rounded-[30px] p-3">
              <img
                src={getImageUrl(product.imageUrl)}
                alt={product.name}
                className="image-bleed h-52 w-full rounded-[24px]"
              />
              <div className="p-2 pt-4">
                <p className="card-metadata">{product.categoryName || "Recommendation"}</p>
                <h3 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-slate-900">{product.name}</h3>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-base font-semibold text-slate-900">
                    Rs {Number(product.price ?? 0).toLocaleString("en-IN")}
                  </span>
                  <span className="soft-pill px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">
                    Suggested
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Recommendations;
