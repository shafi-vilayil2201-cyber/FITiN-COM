import React, { useEffect, useState } from "react";
import { useAdminAuth } from "../context/AdminAuthContext";
import { useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { FaBars, FaBell, FaSearch } from "react-icons/fa";

export default function AdminNavbar({ onToggleSidebar }) {
  const { currentUser, logout: adminLogout } = useAdminAuth();
  const { logout: appLogout } = useContext(AuthContext) || {};
  const navigate = useNavigate();

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    try { localStorage.removeItem('currentUser'); } catch (e) { }
    if (adminLogout) adminLogout();
    if (appLogout) appLogout();
    navigate('/login');
  };

  return (
    <header
      className={`
        w-full px-4 md:px-8 py-3 flex items-center justify-between transition-all duration-300 z-40
        ${scrolled ? "bg-white/80 backdrop-blur-md shadow-lg border-b border-slate-100" : "bg-transparent"}
      `}
    >
      {/* Left: Mobile Toggle & Logo (on mobile) */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <FaBars className="w-5 h-5" />
        </button>

        <div className="md:hidden flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
            F
          </div>
        </div>

        {/* Desktop Search Bar Placeholder */}
        <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-slate-100 border border-slate-200 rounded-xl w-64 text-slate-400 group focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
          <FaSearch className="w-3 h-3" />
          <input
            type="text"
            placeholder="Search dashboard..."
            className="bg-transparent border-none outline-none text-xs text-slate-800 w-full placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-2 md:gap-6">
        <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">
          <FaBell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 border-2 border-white rounded-full"></span>
        </button>

        <div className="h-8 w-[1px] bg-slate-200 hidden sm:block"></div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-bold text-slate-800 leading-tight">
              {currentUser?.name || "Admin"}
            </span>
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-tighter">
              Store Manager
            </span>
          </div>
          <Link to="/admin/profile" className="relative group">
            <img
              className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm group-hover:ring-2 group-hover:ring-emerald-500/20 transition-all"
              src={currentUser?.img || "https://ui-avatars.com/api/?name=Admin&background=059669&color=fff"}
              alt="admin avatar"
            />
          </Link>
        </div>
      </div>
    </header>
  );
}