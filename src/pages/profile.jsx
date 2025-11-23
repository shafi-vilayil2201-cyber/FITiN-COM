import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaBoxOpen, FaSignOutAlt, FaCog, FaShoppingBag } from "react-icons/fa";
import { API_BASE } from '../services/api';

// Helpers
const statusToPercent = (status) => {
  switch ((status || "").toLowerCase()) {
    case "pending": return 10;
    case "processing": return 45;
    case "shipped": return 75;
    case "delivered": return 100;
    case "cancelled": return 0;
    default: return 0;
  }
};

const getStatusColor = (status) => {
  switch ((status || "").toLowerCase()) {
    case "delivered": return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "shipped": return "bg-blue-100 text-blue-700 border-blue-200";
    case "processing": return "bg-amber-100 text-amber-700 border-amber-200";
    case "cancelled": return "bg-red-100 text-red-700 border-red-200";
    default: return "bg-slate-100 text-slate-700 border-slate-200";
  }
};

const fmt = (n) => (typeof n === "number" ? `₹${n.toLocaleString("en-IN")}` : typeof n === "string" && !isNaN(Number(n)) ? `₹${Number(n).toLocaleString("en-IN")}` : "—");

function readLocalUser() {
  try {
    return JSON.parse(localStorage.getItem("currentUser") || localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

function normalizeId(id) {
  return id == null ? null : String(id);
}

// Main Component
export default function Profile() {
  const [user, setUser] = useState(() => readLocalUser());
  const [loadingRefresh, setLoadingRefresh] = useState(false);
  const [activeTab, setActiveTab] = useState("orders"); // 'orders' | 'settings'
  const navigate = useNavigate();

  useEffect(() => {
    function onStorage() {
      setUser(readLocalUser());
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("currentUser");
    setUser(null);
    navigate("/");
  };

  const refresh = async () => {
    const local = readLocalUser();
    if (!local) return;
    setLoadingRefresh(true);

    try {
      // 1. Try fetching by ID
      if (local.id != null) {
        const res = await fetch(`${API_BASE}/users/${encodeURIComponent(local.id)}`);
        if (res.ok) {
          const fresh = await res.json();
          // Fetch orders separately to ensure sync
          const ordersRes = await fetch(`${API_BASE}/orders?userId=${encodeURIComponent(normalizeId(local.id))}`);
          if (ordersRes.ok) {
            const ordersArr = await ordersRes.json();
            if (Array.isArray(ordersArr)) {
              fresh.orders = ordersArr;
            }
          }
          setUser(fresh);
          localStorage.setItem("currentUser", JSON.stringify(fresh));
          return;
        }
      }

      // 2. Fallback: Try fetching by Email
      if (local.email) {
        const res2 = await fetch(`${API_BASE}/users?email=${encodeURIComponent(local.email)}`);
        if (res2.ok) {
          const arr = await res2.json();
          if (Array.isArray(arr) && arr.length) {
            const found = arr[0];
            const ordersRes = await fetch(`${API_BASE}/orders?userId=${encodeURIComponent(normalizeId(found.id))}`);
            if (ordersRes.ok) {
              const ordersArr = await ordersRes.json();
              if (Array.isArray(ordersArr)) {
                found.orders = ordersArr;
              }
            }
            setUser(found);
            localStorage.setItem("currentUser", JSON.stringify(found));
            return;
          }
        }
      }
    } catch (e) {
      console.error("Profile refresh error:", e);
    } finally {
      setLoadingRefresh(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
            <FaUser />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Not Logged In</h2>
          <p className="text-slate-500 mb-6">Please log in to view your profile and orders.</p>
          <button onClick={() => navigate("/login")} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">

        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">My Account</h1>
          <p className="text-slate-500 mt-1">Manage your profile and view your orders</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* LEFT SIDEBAR */}
          <div className="lg:col-span-4 space-y-6">

            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="h-32 bg-gradient-to-r from-emerald-500 to-teal-600"></div>
              <div className="px-6 pb-6 relative">
                <div className="w-24 h-24 bg-white rounded-full p-0 absolute -top-28 left-1/2 transform -translate-x-1/2 shadow-md">
                  <div className="w-full h-full bg-emerald-50 rounded-full flex items-center justify-center text-3xl font-bold text-emerald-600 uppercase">
                    {user.name ? user.name.charAt(0) : <FaUser />}
                  </div>
                </div>
                <div className="mt-16 text-center">
                  <h2 className="text-xl font-bold text-slate-800">{user.name}</h2>
                  <p className="text-sm text-slate-500">{user.email}</p>
                  <div className="mt-6 flex gap-2">
                    <button
                      onClick={refresh}
                      disabled={loadingRefresh}
                      className="flex-1 py-2 px-4 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors disabled:opacity-50"
                    >
                      {loadingRefresh ? "Syncing..." : "Sync Data"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Menu */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <nav className="flex flex-col p-2">
                <button
                  onClick={() => setActiveTab("orders")}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === "orders" ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-50"}`}
                >
                  <FaBoxOpen className="text-lg" />
                  My Orders
                </button>
                <button
                  onClick={() => setActiveTab("settings")}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === "settings" ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-50"}`}
                >
                  <FaCog className="text-lg" />
                  Account Settings
                </button>
                <div className="my-2 border-t border-slate-100"></div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  <FaSignOutAlt className="text-lg" />
                  Sign Out
                </button>
              </nav>
            </div>
          </div>

          {/* RIGHT CONTENT AREA */}
          <div className="lg:col-span-8">

            {/* ORDERS TAB */}
            {activeTab === "orders" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-800">Order History</h2>
                  <span className="text-sm text-slate-500 bg-white px-3 py-1 rounded-full border shadow-sm">
                    {user.orders?.length || 0} Orders
                  </span>
                </div>

                {Array.isArray(user.orders) && user.orders.length > 0 ? (
                  user.orders
                    .sort((a, b) => new Date(b.orderDate || 0) - new Date(a.orderDate || 0))
                    .map((order) => {
                      const pct = statusToPercent(order.status);
                      return (
                        <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
                          {/* Order Header */}
                          <div className="px-6 py-4 border-b border-slate-50 flex flex-wrap gap-4 justify-between items-center bg-slate-50/50">
                            <div>
                              <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Order ID</div>
                              <div className="text-sm font-mono text-slate-700">#{order.id}</div>
                            </div>
                            <div>
                              <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Date Placed</div>
                              <div className="text-sm text-slate-700">{order.orderDate ? new Date(order.orderDate).toLocaleDateString() : "—"}</div>
                            </div>
                            <div>
                              <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Total Amount</div>
                              <div className="text-sm font-bold text-emerald-600">{fmt(order.totalAmount)}</div>
                            </div>
                            <div>
                              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                                {order.status || "Pending"}
                              </span>
                            </div>
                          </div>

                          {/* Order Items */}
                          <div className="p-6">
                            <div className="space-y-4">
                              {Array.isArray(order.items) && order.items.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-4">
                                  <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 border border-slate-200">
                                    {item.image ? (
                                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                                        <FaShoppingBag />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="text-sm font-semibold text-slate-800 line-clamp-1">{item.name}</h4>
                                    <p className="text-xs text-slate-500">Qty: {item.quantity || 1}</p>
                                  </div>
                                  <div className="text-sm font-medium text-slate-600">
                                    {fmt((item.price || 0) * (item.quantity || 1))}
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Progress Bar */}
                            <div className="mt-6">
                              <div className="flex justify-between text-xs text-slate-500 mb-2">
                                <span>Processing</span>
                                <span>Shipped</span>
                                <span>Delivered</span>
                              </div>
                              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                <div
                                  className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out"
                                  style={{ width: `${pct}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                ) : (
                  <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-300">
                    <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                      <FaBoxOpen />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900">No orders yet</h3>
                    <p className="text-slate-500 mt-1">When you place an order, it will appear here.</p>
                    <button onClick={() => navigate("/")} className="mt-6 px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors">
                      Start Shopping
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* SETTINGS TAB */}
            {activeTab === "settings" && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                <h2 className="text-xl font-bold text-slate-800 mb-6">Account Settings</h2>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={user.name || ""}
                        disabled
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                      <input
                        type="email"
                        value={user.email || ""}
                        disabled
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100">
                    <h3 className="text-lg font-medium text-slate-800 mb-4">Security</h3>
                    <button className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors">
                      Change Password
                    </button>
                  </div>

                  <div className="pt-6 border-t border-slate-100">
                    <h3 className="text-lg font-medium text-slate-800 mb-4">Preferences</h3>
                    <div className="flex items-center gap-3">
                      <input type="checkbox" id="notif" className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500" defaultChecked />
                      <label htmlFor="notif" className="text-sm text-slate-600">Receive email notifications for order updates</label>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}