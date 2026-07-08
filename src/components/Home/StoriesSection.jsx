import React from "react";
import { Link } from "react-router-dom";
import { FaArrowRight, FaCapsules, FaFlask, FaShieldAlt } from "react-icons/fa";

const stories = [
  {
    title: "Trainer-approved product curation",
    quote:
      "The best premium sports stores feel quiet, intentional, and guided. The layout should help users decide faster without feeling rushed.",
    name: "Alicia Mercer",
    role: "Performance Coach",
  },
  {
    title: "Customer confidence through calmer UI",
    quote:
      "Softer cards, clearer spacing, and stronger hierarchy make commerce feel more trustworthy, especially when products come from a live backend.",
    name: "Rohan Mathew",
    role: "Product Consultant",
  },
];

const benefitItems = [
  {
    title: "Clean daily support",
    copy: "Protein, hydration, recovery, and wellness picks arranged with calmer product storytelling.",
    icon: <FaCapsules size={14} />,
  },
  {
    title: "Formula-first curation",
    copy: "A dedicated supplements shelf lets you separate sports gear discovery from nutrition decisions.",
    icon: <FaFlask size={14} />,
  },
  {
    title: "Science-Backed",
    copy: "Every formula is third-party lab tested for purity, heavy metals, and absolute label accuracy.",
    icon: <FaShieldAlt size={14} />,
  },
];

const StoriesSection = () => {
  return (
    <section className="px-3 py-10 md:px-6 md:py-14">
      <div className="section-shell grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="premium-card rounded-[36px] p-6 md:p-8">
          <p className="section-kicker">Social proof</p>
          <h2 className="section-title mt-4 text-slate-900">
            Real Coaching, Real Performance.
          </h2>
          <div className="mt-8 grid gap-4">
            {stories.map((story) => (
              <article
                key={story.title}
                className="rounded-[28px] border border-white/78 bg-white/76 p-5 shadow-[0_12px_28px_rgba(148,163,184,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]"
              >
                <p className="card-metadata">{story.title}</p>
                <p className="mt-3 text-lg leading-8 tracking-[-0.02em] text-slate-900">“{story.quote}”</p>
                <p className="mt-4 text-sm font-semibold text-slate-700">{story.name}</p>
                <p className="text-sm text-slate-500">{story.role}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="premium-card relative overflow-hidden rounded-[36px] p-4 md:p-5">
          <div className="absolute inset-0 bg-linear-to-br from-[#eff5df] via-[#f8f8f5] to-[#e9eefb]" />
          <div className="relative z-10 overflow-hidden rounded-[30px] border border-white/80 bg-white/45 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] md:p-6">
            <div className="relative overflow-hidden rounded-[28px] bg-linear-to-br from-[#f9fbf3] via-white to-[#edf2ff] p-6">
              <div className="absolute -right-12 -top-10 h-40 w-40 rounded-full bg-[#dff2b8]/70 blur-3xl" />
              <div className="absolute -bottom-10 left-6 h-32 w-32 rounded-full bg-[#dde7ff]/70 blur-3xl" />
              <img
                src="https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?auto=format&fit=crop&w=1200&q=80"
                alt="Premium supplements"
                className="image-bleed relative z-10 h-[18rem] w-full rounded-[24px] border border-white/90 shadow-[0_24px_46px_rgba(148,163,184,0.16)]"
              />
            </div>

            <div className="mt-5">
              <p className="card-metadata">Supplement launch pad</p>
              <h3 className="mt-3 text-[2.2rem] font-semibold leading-[1] tracking-[-0.06em] text-slate-900 md:text-[2.8rem]">
                Enter the nutrition side of FitN.
              </h3>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                Browse protein, hydration, recovery, and daily support with a dedicated page designed for supplements.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link to="/supplements" className="primary-cta inline-flex items-center gap-2 px-5 py-3 text-sm">
                Open supplements
                <FaArrowRight size={13} />
              </Link>
              <div className="soft-pill inline-flex items-center gap-2 px-4 py-3 text-sm text-slate-700">
                <FaCapsules size={13} />
                Certified Purity
              </div>
            </div>

            <div className="mt-6 grid gap-3">
              {benefitItems.map((item) => (
                <div
                  key={item.title}
                  className="rounded-[22px] border border-white/75 bg-white/72 px-4 py-4 shadow-[0_10px_24px_rgba(148,163,184,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]"
                >
                  <div className="flex items-start gap-3">
                    <div className="soft-pill p-3 text-slate-700">{item.icon}</div>
                    <div>
                      <p className="text-sm font-semibold tracking-[-0.02em] text-slate-900">{item.title}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-500">{item.copy}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StoriesSection;
