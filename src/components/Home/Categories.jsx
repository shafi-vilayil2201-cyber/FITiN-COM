import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { IMAGE_BASE_URL } from "../../services/api";

const getImageUrl = (value) => {
  if (!value) {
    return "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80";
  }
  return value.startsWith("http") ? value : `${IMAGE_BASE_URL}${value}`;
};

const Categories = ({
  categories = [],
  products = [],
  loading,
  selectedCategory,
  onCategorySelect,
  sectionRef,
}) => {
  const navigate = useNavigate();
  const activeCategoryRef = useRef(null);

  useEffect(() => {
    activeCategoryRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [selectedCategory]);

  const filteredProducts = selectedCategory
    ? products.filter((product) => product.categoryName === selectedCategory).slice(0, 3)
    : [];

  return (
    <section ref={sectionRef} className="px-3 py-10 md:px-6 md:py-14">
      <div className="section-shell">
        <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="section-title mt-4 text-slate-900">Featured Categories</h2>
            <p className="body-copy mt-4 max-w-2xl">
              Discover curated equipment, apparel, and nutrition arranged for structured and easy browsing.
            </p>
          </div>
          <button onClick={() => navigate("/products")} className="ghost-cta self-start px-5 py-3 text-sm">
            View all products
          </button>
        </div>

        <div className="grid gap-5 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="relative">
            <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-10 rounded-t-[30px] bg-linear-to-b from-[#f5f5f3] to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-10 rounded-b-[30px] bg-linear-to-t from-[#f5f5f3] to-transparent" />
            <div className="grid max-h-[30.5rem] gap-4 overflow-y-auto pr-2">
            {categories.map((category, index) => {
              const active = selectedCategory === category.name;
              return (
                <button
                  key={category.id ?? category.name ?? index}
                  ref={active ? activeCategoryRef : null}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onCategorySelect?.(category.name)}
                  className={`premium-card rounded-[30px] p-4 text-left md:p-5 ${
                    active ? "is-active ring-1 ring-slate-900/8" : ""
                  }`}
                >
                  <div className="grid grid-cols-[1fr_auto] items-center gap-4">
                    <div>
                      <p className="card-metadata">Category {String(index + 1).padStart(2, "0")}</p>
                      <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-slate-900 md:text-3xl">
                        {category.name}
                      </h3>
                      <p className="mt-2 text-sm text-slate-500">
                        Premium equipment, training aids, and supporting products arranged for calmer discovery.
                      </p>
                    </div>
                    <img
                      src={getImageUrl(category.imageUrl)}
                      alt={category.name}
                      className="image-bleed h-20 w-20 rounded-[24px] object-cover md:h-24 md:w-24"
                    />
                  </div>
                </button>
              );
            })}
            </div>
          </div>

          <div className="premium-card rounded-[34px] p-4 md:p-5">
            <div className="mb-4 flex items-end justify-between">
              <div>
                <p className="card-metadata">{selectedCategory || "Category preview"}</p>
                <h3 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-slate-900 md:text-4xl">
                  Curated highlights
                </h3>
              </div>
            </div>

            {loading ? (
              <div className="rounded-[28px] bg-white/70 px-6 py-20 text-center text-slate-500">Loading preview...</div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredProducts.map((product) => (
                  <article
                    key={product.id}
                    className="overflow-hidden rounded-[28px] bg-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]"
                  >
                    <img
                      src={getImageUrl(product.imageUrl)}
                      alt={product.name}
                      className="image-bleed h-52 w-full rounded-[28px] rounded-b-[18px]"
                    />
                    <div className="p-4">
                      <p className="card-metadata">{product.brand || selectedCategory}</p>
                      <h4 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-slate-900">
                        {product.name}
                      </h4>
                      <div className="mt-4 flex items-center justify-between gap-3">
                        <p className="text-lg font-semibold tracking-[-0.03em] text-slate-900">
                          Rs {Number(product.price ?? 0).toLocaleString("en-IN")}
                        </p>
                        <button onClick={() => navigate(`/products/${product.id}`)} className="soft-pill px-4 py-2 text-sm font-semibold text-slate-700">
                          Details
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Categories;
