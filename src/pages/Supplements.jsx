import React, { useState } from "react";
import { FaLeaf, FaShieldAlt, FaBolt } from "react-icons/fa";

const supplementItems = [
  {
    id: 1,
    name: "Whey Protein Isolate",
    brand: "FitN Labs",
    category: "Protein",
    price: 2499,
    accent: "Recovery blend",
    image:
      "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 2,
    name: "Pre-Workout Focus",
    brand: "Core Fuel",
    category: "Energy",
    price: 1899,
    accent: "Citrus charge",
    image:
      "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 3,
    name: "Daily Multivitamin",
    brand: "WellForm",
    category: "Wellness",
    price: 1299,
    accent: "Daily support",
    image:
      "https://images.unsplash.com/photo-1579722821273-0f6c4d44362f?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 4,
    name: "Hydration Electro Mix",
    brand: "Pulse Hydrate",
    category: "Hydration",
    price: 999,
    accent: "Endurance ready",
    image:
      "https://images.unsplash.com/photo-1622484212850-eb596d769edc?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 5,
    name: "Plant Protein Blend",
    brand: "Nature Lift",
    category: "Protein",
    price: 2199,
    accent: "Smooth vanilla",
    image:
      "https://images.unsplash.com/photo-1610725664285-7c57e6eeac3f?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 6,
    name: "Omega Recovery Caps",
    brand: "MoveWell",
    category: "Recovery",
    price: 1499,
    accent: "Joint comfort",
    image:
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=900&q=80",
  },
];

const filterOptions = ["All", "Protein", "Energy", "Wellness", "Hydration", "Recovery"];

const highlights = [
  {
    title: "Clean formulas",
    copy: "Dummy catalogue now, ready for backend wiring later.",
    icon: <FaLeaf size={14} />,
  },
  {
    title: "Verified feel",
    copy: "Mild card styling kept consistent with the store.",
    icon: <FaShieldAlt size={14} />,
  },
  {
    title: "Quick browse",
    copy: "Static items make the supplements page stable during API work.",
    icon: <FaBolt size={14} />,
  },
];

const Supplements = () => {
  const [activeFilter, setActiveFilter] = useState("All");

  const visibleItems =
    activeFilter === "All"
      ? supplementItems
      : supplementItems.filter((item) => item.category === activeFilter);

  return (
    <div className="section-shell px-3 pb-12 pt-6 md:px-0">
      <div className="premium-card rounded-[36px] p-5 md:p-6">
        <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="section-kicker">Supplements</p>
            <h1 className="section-title mt-4 text-slate-900">A calm supplements shelf, decoupled from the backend.</h1>
            <p className="body-copy mt-5 max-w-2xl">
              This page uses local dummy items for now, so design and routing can move forward before supplement APIs are ready.
            </p>
          </div>

          <div className="premium-panel rounded-[28px] p-5">
            <div className="grid gap-4">
              {highlights.map((item) => (
                <div key={item.title} className="flex items-start gap-3 rounded-[22px] border border-white/70 bg-white/65 px-4 py-4">
                  <div className="soft-pill p-3 text-slate-700">{item.icon}</div>
                  <div>
                    <p className="text-sm font-semibold tracking-[-0.02em] text-slate-900">{item.title}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">{item.copy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          {filterOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setActiveFilter(option)}
              className={`soft-pill px-4 py-3 text-sm font-medium transition ${
                activeFilter === option ? "bg-slate-900 text-white" : "text-slate-700"
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {visibleItems.map((item) => (
            <article
              key={item.id}
              className="premium-card overflow-hidden rounded-[30px] border border-white/75 bg-white/82 p-3 shadow-[0_16px_34px_rgba(148,163,184,0.10),inset_0_1px_0_rgba(255,255,255,0.88)]"
            >
              <div className="relative overflow-hidden rounded-[24px] border border-slate-200/45 bg-linear-to-b from-white to-[#f3f4ef]">
                <img src={item.image} alt={item.name} className="image-bleed h-72 w-full" />
                <span className="absolute left-3 top-3 floating-chip px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-700">
                  {item.category}
                </span>
              </div>

              <div className="mt-3 border-t border-slate-200/70 p-2 pt-4">
                <p className="card-metadata">{item.brand}</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-900">{item.name}</h2>
                <p className="mt-2 text-sm text-slate-500">{item.accent}</p>
                <div className="mt-5 flex items-end justify-between gap-3">
                  <p className="text-xl font-semibold tracking-[-0.04em] text-slate-900">
                    Rs {item.price.toLocaleString("en-IN")}
                  </p>
                  <button type="button" className="ghost-cta px-4 py-2 text-sm">
                    View item
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Supplements;
