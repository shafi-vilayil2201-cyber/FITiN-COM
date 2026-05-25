import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { IMAGE_BASE_URL } from "../../services/api";

const getImageUrl = (value) =>
{
  if (!value)
  {
    return "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1400&q=80";
  }
  return value.startsWith("http") ? value.replace(":7071", ":5252") : `${IMAGE_BASE_URL}${value}`;
};

const HeroBanner = ({
  products = [],
  categories = [],
  loading,
  selectedCategory,
  onCategorySelect,
}) =>
{
  const heroProduct = products[0];
  const heroImage = getImageUrl(heroProduct?.imageUrl || categories[0]?.imageUrl);
  const categoryScrollRef = useRef(null);

  const scrollCategories = (direction) =>
  {
    if (!categoryScrollRef.current)
    {
      return;
    }

    categoryScrollRef.current.scrollBy({
      top: direction * 56,
      behavior: "smooth",
    });
  };

  return (
    <section className="px-3 md:px-6">
      <div className="section-shell">
        <div className="premium-card relative overflow-hidden rounded-[34px] p-0">
          <div className="hero-image-mask relative overflow-hidden rounded-[34px]">
            {!loading && (
              <img
                src={heroImage}
                alt={heroProduct?.name || "Sports hero"}
                className="image-bleed h-[860px] w-full md:h-[940px]"
              />
            )}
            <div className="absolute inset-0 bg-linear-to-r from-[#eef0ea]/92 via-[#eef0ea]/58 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-[#f5f5f3] to-transparent" />
          </div>

          <div className="absolute inset-0 flex flex-col p-6 md:p-10">
            <div className="shrink-0">
              <div className="flex items-start gap-2">
                <div
                  ref={categoryScrollRef}
                  className="max-h-[8.5rem] flex-1 overflow-y-auto pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    {categories.map((category) => (
                      <button
                        key={category.id ?? category.name}
                        type="button"
                        onClick={() => onCategorySelect?.(category.name)}
                        aria-pressed={selectedCategory === category.name}
                        className={`soft-pill px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] transition ${
                          selectedCategory === category.name ? "is-active" : ""
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex shrink-0 flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => scrollCategories(-1)}
                    className="soft-pill flex h-8 w-8 items-center justify-center text-sm font-semibold text-slate-700"
                    aria-label="Scroll categories up"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollCategories(1)}
                    className="soft-pill flex h-8 w-8 items-center justify-center text-sm font-semibold text-slate-700"
                    aria-label="Scroll categories down"
                  >
                    ↓
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-1 items-start">
              <div className="max-w-[620px] pt-14 md:pt-20">
                <p className="section-kicker">Performance Commerce, Reframed</p>
                <h1 className="mt-4 max-w-[10ch] text-[2.9rem] font-semibold leading-[0.94] tracking-[-0.06em] text-slate-900 md:text-[4.2rem]">
                  Shop the calmer side of modern sports performance.
                </h1>
                <p className="mt-5 max-w-[520px] text-[1.02rem] leading-7 text-slate-600 md:text-[1.08rem]">
                  Curated gear, category-led discovery, and premium product presentation built around live backend content.
                </p>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <Link to="/products" className="primary-cta px-6 py-4 text-center text-sm">
                    Explore products
                  </Link>
                  <Link to="/categories" className="ghost-cta px-6 py-4 text-center text-sm">
                    Browse categories
                  </Link>
                </div>
              </div>
            </div>

            <div className="shrink-0">
              <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
                <div className="premium-panel rounded-[24px] p-4 md:p-5">
                  <p className="card-metadata">Featured product</p>
                  <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div className="min-w-0">
                      <h2 className="text-[1.9rem] font-semibold leading-tight tracking-[-0.05em] text-slate-900 md:text-[2.4rem]">
                        {heroProduct?.name || "Curated sports essentials"}
                      </h2>
                      <p className="mt-2 text-sm text-slate-500">
                        {heroProduct?.brand || "FitN Select"} {heroProduct?.categoryName ? `· ${heroProduct.categoryName}` : ""}
                      </p>
                    </div>
                    <div className="w-fit rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
                      {heroProduct?.price ? `Rs ${Number(heroProduct.price).toLocaleString("en-IN")}` : "New drop"}
                    </div>
                  </div>
                </div>

                <div className="premium-panel rounded-[24px] p-4 md:p-5">
                  <p className="card-metadata">Highlights</p>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-slate-600">
                    <div>
                      <p className="text-lg font-semibold tracking-[-0.03em] text-slate-900">
                        {products.length || "50+"}
                      </p>
                      <p>Products live</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold tracking-[-0.03em] text-slate-900">
                        {categories.length || "6+"}
                      </p>
                      <p>Categories</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold tracking-[-0.03em] text-slate-900">Fast</p>
                      <p>Easy browsing</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold tracking-[-0.03em] text-slate-900">Fresh</p>
                      <p>Latest picks</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
