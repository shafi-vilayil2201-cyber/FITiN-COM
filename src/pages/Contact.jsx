import React from "react";
import { FaEnvelope, FaMapMarkerAlt, FaPhoneAlt } from "react-icons/fa";

const Contact = () => {
  return (
    <section className="px-3 py-8 md:px-6 md:py-12">
      <div className="section-shell grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="premium-card rounded-[36px] p-6 md:p-8">
          <p className="section-kicker">Contact</p>
          <h1 className="display-title mt-5 text-slate-900">Get in touch with the FitN team.</h1>
          <p className="body-copy mt-5">
            Our dedicated customer experience team is here to assist with product queries, order tracking, and custom recommendations.
          </p>

          <div className="mt-8 grid gap-4">
            {[
              [<FaPhoneAlt />, "Phone", "+91 98765 43210"],
              [<FaEnvelope />, "Email", "support@fitin.com"],
              [<FaMapMarkerAlt />, "Location", "Kerala, India"],
            ].map(([icon, label, value]) => (
              <div key={label} className="rounded-[26px] bg-white/72 p-4">
                <div className="flex items-start gap-4">
                  <div className="soft-pill p-3 text-slate-700">{icon}</div>
                  <div>
                    <p className="card-metadata">{label}</p>
                    <p className="mt-2 text-lg font-semibold tracking-[-0.03em] text-slate-900">{value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <form className="premium-card rounded-[36px] p-6 md:p-8">
          <p className="section-kicker">Message</p>
          <h2 className="section-title mt-4 text-slate-900">Send a note</h2>
          <div className="mt-6 grid gap-4">
            <input type="text" placeholder="Your name" className="rounded-[22px] border border-white/80 bg-white/72 px-5 py-4 outline-none" />
            <input type="email" placeholder="Your email" className="rounded-[22px] border border-white/80 bg-white/72 px-5 py-4 outline-none" />
            <textarea placeholder="Your message" rows={6} className="rounded-[22px] border border-white/80 bg-white/72 px-5 py-4 outline-none" />
            <button type="submit" className="primary-cta w-fit px-6 py-4 text-sm">
              Send message
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default Contact;
