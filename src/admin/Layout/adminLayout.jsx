import React, { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";
import AdminNavbar from "../common/adminNavbar";
import {
  FaHome,
  FaBoxOpen,
  FaShoppingCart,
  FaBars,
  FaTimes,
  FaUser,
  FaChartBar,
  FaSignOutAlt,
  FaLayerGroup,
  FaFlask
} from "react-icons/fa";

export default function AdminLayout() {
  const { currentUser, logout } = useAdminAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { to: "/admin/dashboard", label: "Dashboard", icon: <FaChartBar /> },
    { to: "/admin/products", label: "Products", icon: <FaBoxOpen /> },
    { to: "/admin/supplements", label: "Supplements", icon: <FaFlask /> },
    { to: "/admin/categories", label: "Categories", icon: <FaLayerGroup /> },
    { to: "/admin/orders", label: "Orders", icon: <FaShoppingCart /> },
    { to: "/admin/users", label: "Users", icon: <FaUser /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navbar for mobile or global actions */}
      <div className="sticky top-0 z-40 w-full">
        <AdminNavbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      </div>

      <div className="flex flex-1 relative">
        {/* Sidebar Backdrop (Mobile) */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            fixed top-0 left-0 h-screen w-72 bg-white border-r border-slate-200 z-50 
            transition-transform duration-300 ease-in-out md:translate-x-0
            ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
            flex flex-col shadow-xl md:shadow-none
          `}
        >
          {/* Sidebar Header / Branding */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-emerald-200/50">
                F
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 tracking-tight">
                FITiN Admin
              </span>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
            >
              <FaTimes />
            </button>
          </div>

          {/* Admin Profile Section */}
          <div className="p-6 border-b border-slate-50">
            <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50 border border-slate-200/50">
              <div className="relative">
                <img
                  className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                  src={currentUser?.img || "https://ui-avatars.com/api/?name=Admin&background=059669&color=fff"}
                  alt="admin profile"
                />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">
                  {currentUser?.name || "Administrator"}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {currentUser?.email || "admin@fitin.com"}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 p-6 space-y-1.5 overflow-y-auto">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 px-3">
              Main Menu
            </p>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                  ${isActive
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200/50 transform scale-[1.02]"
                    : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
                  }
                `}
              >
                {({ isActive }) => (
                  <>
                    <span className={`text-lg transition-transform duration-200 group-hover:scale-110 ${isActive ? "text-white" : "text-slate-400 group-hover:text-emerald-600"}`}>
                      {item.icon}
                    </span>
                    <span className="font-semibold text-sm tracking-wide">
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-6 border-t border-slate-100">
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all font-bold text-sm"
            >
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
            <div className="mt-4 flex flex-col items-center gap-1 opacity-50">
              <span className="text-[10px] font-bold text-slate-400">FITiN DASHBOARD V2.0</span>
              <span className="text-[9px] text-slate-400">© 2026 ALL RIGHTS RESERVED</span>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 md:ml-72 min-h-screen bg-slate-50 transition-all duration-300">
          <div className="p-4 md:p-8 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}