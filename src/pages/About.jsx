import React from "react";
import { FaAppleAlt, FaDumbbell, FaRunning } from "react-icons/fa";

const items = [
  {
    icon: <FaRunning />,
    title: "Track progress",
    copy: "Monitor routines and performance changes inside a cleaner sports lifestyle environment.",
  },
  {
    icon: <FaDumbbell />,
    title: "Build plans",
    copy: "Support training, conditioning, and recovery with calmer high-end sports commerce patterns.",
  },
  {
    icon: <FaAppleAlt />,
    title: "Fuel better",
    copy: "Connect supplements and supporting products to the same premium visual system.",
  },
];

const About = () => {
  return (
    <section className="px-3 py-8 md:px-6 md:py-12">
      <div className="section-shell premium-card rounded-[36px] p-6 md:p-8">
        <p className="section-kicker">About FitN</p>
        <h1 className="display-title mt-5 text-slate-900">Built for performance-focused shoppers.</h1>
        <p className="body-copy mt-6 max-w-3xl">
          FitN is shifting toward a reusable sports commerce language with premium card architecture,
          editorial spacing, and softer product presentation inspired by Apple Card level restraint.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {items.map((item) => (
            <article key={item.title} className="rounded-[30px] bg-white/72 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.82)]">
              <div className="soft-pill inline-flex p-3 text-slate-700">{item.icon}</div>
              <h2 className="mt-5 text-2xl font-semibold tracking-[-0.04em] text-slate-900">{item.title}</h2>
              <p className="mt-4 text-sm leading-7 text-slate-500">{item.copy}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
