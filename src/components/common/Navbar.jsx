import React, { useContext, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaBars, FaHeart, FaShoppingBag, FaTimes, FaUser } from "react-icons/fa";
import { AuthContext } from "../../contexts/AuthContext";
import { CartContext } from "../../contexts/CartContext";
import { WishlistContext } from "../../contexts/wishListContext";

const links = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Products", to: "/products" },
  { label: "Accessories", to: "/categories" },
  { label: "Supplements", to: "/supplements" },
  { label: "Contact", to: "/contact" },
];

const Navbar = () =>
{
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const { cart } = useContext(CartContext);
  const { wishList } = useContext(WishlistContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() =>
  {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() =>
  {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () =>
  {
    try
    {
      logout && logout();
    } catch (error)
    {
      console.error("Logout error:", error);
    }
    navigate("/login");
  };

  return (
    <div className="sticky top-0 z-50 px-3 pt-3 md:px-6 md:pt-4">
      <header
        className={`section-shell rounded-[28px] border border-white/80 transition-all duration-200 ${scrolled ? "premium-panel shadow-[0_18px_40px_rgba(28,32,38,0.08)]" : "bg-white/56 backdrop-blur-lg"
          }`}
      >
        <nav className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/assets/Fitness.png"
              alt="FitN logo"
              className="h-11 w-11 rounded-[18px] object-cover shadow-[0_12px_24px_rgba(35,45,58,0.08)]"
            />
            <div>
              <p className="text-lg font-semibold tracking-[-0.03em] text-slate-900">FitN</p>
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Sports Commerce</p>
            </div>
          </Link>

          <ul className="hidden items-center gap-8 xl:flex">
            {links.map((link) =>
            {
              const active = location.pathname === link.to;
              return (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className={`border-b pb-2 text-sm font-medium transition ${active
                        ? "border-slate-900 text-slate-900"
                        : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-900"
                      }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="hidden items-center gap-3 md:flex">
            <Link to="/wishlist" className="soft-pill relative p-3 text-slate-700">
              <FaHeart size={14} />
              {wishList?.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ff8d49] px-1 text-[10px] font-semibold text-white">
                  {wishList.length}
                </span>
              )}
            </Link>
            <Link to="/cart" className="soft-pill relative p-3 text-slate-700">
              <FaShoppingBag size={14} />
              {cart?.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-900 px-1 text-[10px] font-semibold text-white">
                  {cart.length}
                </span>
              )}
            </Link>
            {user ? (
              <>
                <Link to="/profile" className="soft-pill p-3 text-slate-700">
                  <FaUser size={14} />
                </Link>
                <button onClick={handleLogout} className="ghost-cta px-4 py-3 text-sm">
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="primary-cta px-5 py-3 text-sm">
                Login
              </Link>
            )}
          </div>

          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="soft-pill p-3 text-slate-700 xl:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </nav>

        {menuOpen && (
          <div className="border-t border-slate-200/70 px-4 pb-4 pt-3 xl:hidden">
            <ul className="flex flex-col gap-3">
              {links.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="block rounded-[18px] bg-white/72 px-4 py-3 text-sm font-medium text-slate-700">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </header>
    </div>
  );
};

export default Navbar;
