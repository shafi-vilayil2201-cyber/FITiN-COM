import React from "react";
import { Link } from "react-router-dom";
import { FaArrowUp, FaFacebookF, FaInstagram, FaLinkedinIn, FaTwitter } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="px-3 pb-8 pt-12 md:px-6 md:pt-16">
      <div className="section-shell premium-card rounded-[36px] p-6 md:p-8">
        <div className="grid gap-8 border-b border-slate-200/80 pb-8 lg:grid-cols-[1.2fr_0.8fr_0.8fr_1fr]">
          <div>
            <p className="section-kicker">FitN ecosystem</p>
            <h2 className="section-title mt-4 text-slate-900">Calm sports commerce with reusable card architecture.</h2>
            <p className="body-copy mt-4 max-w-md">
              The footer continues the same warm-neutral system as the storefront, so the experience ends with support,
              membership, and brand trust rather than a visual reset.
            </p>
            <div className="mt-6 flex gap-3">
              {[FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn].map((Icon, index) => (
                <a key={index} href="#" className="soft-pill p-3 text-slate-700">
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="card-metadata text-slate-500">Store</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li><Link to="/products">All Products</Link></li>
              <li><Link to="/categories">Categories</Link></li>
              <li><Link to="/wishlist">Wishlist</Link></li>
              <li><Link to="/cart">Cart</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="card-metadata text-slate-500">Company</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li><Link to="/about">About</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/checkout">Checkout</Link></li>
              <li><Link to="/profile">Account</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="card-metadata text-slate-500">Membership</h3>
            <div className="mt-4 rounded-[24px] bg-linear-to-br from-[#ffffff] to-[#eef2e8] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.82)]">
              <p className="text-lg font-semibold tracking-[-0.03em] text-slate-900">Get curated drops and member pricing cues.</p>
              <button className="accent-cta mt-5 px-4 py-3 text-sm">Join membership</button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 pt-6 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-slate-500">© 2026 FitN. Premium sports commerce system.</p>
          <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="ghost-cta self-start px-4 py-3 text-sm">
            Back to top <FaArrowUp className="ml-1 inline" />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
