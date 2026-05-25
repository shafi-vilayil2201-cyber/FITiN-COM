import React from "react";

const plans = [
  {
    badge: "Member favorite",
    title: "Starter Access",
    copy: "Early access to featured drops, soft recommendations, and members-only pricing cues.",
    price: "Rs 499",
    accent: "from-[#dff2b8] to-[#f7f7f6]",
  },
  {
    badge: "Premium",
    title: "Pro Performance",
    copy: "Priority campaigns, curated essentials, and a more personalized product journey.",
    price: "Rs 1499",
    accent: "from-[#dde7ff] to-[#f7f7f6]",
  },
];

const MembershipSection = () => {
  return (
    <section className="px-3 py-10 md:px-6 md:py-14">
      <div className="section-shell premium-card rounded-[38px] p-6 md:p-8">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="section-kicker">Membership</p>
            <h2 className="section-title mt-4 text-slate-900">Subscription offers should feel like premium services.</h2>
          </div>
          <button className="accent-cta self-start px-5 py-3 text-sm">See membership options</button>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {plans.map((plan) => (
            <article
              key={plan.title}
              className={`rounded-[32px] bg-linear-to-br ${plan.accent} p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]`}
            >
              <span className="soft-pill px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-700">
                {plan.badge}
              </span>
              <h3 className="mt-6 text-3xl font-semibold tracking-[-0.05em] text-slate-900">{plan.title}</h3>
              <p className="mt-4 max-w-md text-sm leading-7 text-slate-600">{plan.copy}</p>
              <div className="mt-8 flex items-center justify-between">
                <p className="text-3xl font-semibold tracking-[-0.05em] text-slate-900">{plan.price}</p>
                <button className="primary-cta px-5 py-3 text-sm">Join now</button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MembershipSection;
