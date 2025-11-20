// src/pages/profile.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

const statusToPercent = (status) => {
  switch ((status || "").toLowerCase()) {
    case "pending":
      return 10;
    case "processing":
      return 45;
    case "shipped":
      return 75;
    case "delivered":
      return 100;
    case "cancelled":
      return 0;
    default:
      return 0;
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

export default function Profile() {
  const [user, setUser] = useState(() => readLocalUser());
  const [loadingRefresh, setLoadingRefresh] = useState(false);
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
      if (local.id != null) {
        const res = await fetch(`${API_BASE}/users/${encodeURIComponent(local.id)}`);
        if (res.ok) {
          const fresh = await res.json();
          const ordersRes = await fetch(`${API_BASE}/orders?userId=${encodeURIComponent(normalizeId(local.id))}`);
          if (ordersRes.ok) {
            const ordersArr = await ordersRes.json();
            if (Array.isArray(ordersArr) && ordersArr.length) {
              fresh.orders = ordersArr;
            }
          }
          setUser(fresh);
          try {
            localStorage.setItem("currentUser", JSON.stringify(fresh));
          } catch { }
          return;
        }
      }

      if (local.email) {
        const res2 = await fetch(`${API_BASE}/users?email=${encodeURIComponent(local.email)}`);
        if (res2.ok) {
          const arr = await res2.json();
          if (Array.isArray(arr) && arr.length) {
            const found = arr[0];
            try {
              const ordersRes = await fetch(`${API_BASE}/orders?userId=${encodeURIComponent(normalizeId(found.id))}`);
              if (ordersRes.ok) {
                const ordersArr = await ordersRes.json();
                if (Array.isArray(ordersArr) && ordersArr.length) {
                  found.orders = ordersArr;
                }
              }
            } catch { }
            setUser(found);
            try {
              localStorage.setItem("currentUser", JSON.stringify(found));
            } catch { }
            return;
          }
        }
      }

      try {
        const usersRes = await fetch(`${API_BASE}/users`);
        if (usersRes.ok) {
          const allUsers = await usersRes.json();
          if (Array.isArray(allUsers)) {
            const match =
              (local.id && allUsers.find((u) => normalizeId(u.id) === normalizeId(local.id))) ||
              (local.email && allUsers.find((u) => (u.email || "").toLowerCase() === (local.email || "").toLowerCase())) ||
              null;
            if (match) {
              let orders = [];
              try {
                const ordersRes = await fetch(`${API_BASE}/orders?userId=${encodeURIComponent(normalizeId(match.id))}`);
                if (ordersRes.ok) orders = await ordersRes.json();
              } catch { }
              if ((!orders || !orders.length) && Array.isArray(match.orders)) {
                orders = match.orders.map((o) => ({ ...o, userId: normalizeId(match.id) }));
              }
              const merged = { ...match, orders: orders || [] };
              setUser(merged);
              try {
                localStorage.setItem("currentUser", JSON.stringify(merged));
              } catch { }
            }
          }
        }
      } catch (e) {
      }
    } catch (e) {
      console.error("Profile refresh error:", e);
    } finally {
      setLoadingRefresh(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center text-slate-600">You are not logged in.</div>
      </div>
    );
  }

  const latestOrder =
    Array.isArray(user.orders) && user.orders.length
      ? [...user.orders].sort((a, b) => new Date(b.orderDate || 0) - new Date(a.orderDate || 0))[0]
      : null;

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex justify-center">
      <div className="w-full max-w-2xl space-y-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center text-xl font-semibold text-emerald-700">
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div>
              <div className="text-lg font-semibold text-slate-800">{user.name}</div>
              <div className="text-sm text-slate-500 break-all">{user.email}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={refresh}
              disabled={loadingRefresh}
              className="px-3 py-1 rounded-md bg-emerald-600 text-white text-sm hover:bg-emerald-700 disabled:opacity-60"
            >
              {loadingRefresh ? "Refreshing..." : "Refresh"}
            </button>
            <button onClick={handleLogout} className="px-3 py-1 rounded-md bg-red-500 text-white text-sm hover:bg-red-600">
              Logout
            </button>
          </div>
        </div>

        <section className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">Orders</h3>
            <div className="text-sm text-slate-500">{user.orders?.length ?? 0} orders</div>
          </div>

          <div className="mt-3 space-y-3">
            {Array.isArray(user.orders) && user.orders.length ? (
              user.orders.map((o) => {
                const pct = statusToPercent(o.status);
                return (
                  <div key={normalizeId(o.id) || Math.random()} className="rounded-md p-3 border">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-slate-800">Order #{o.id}</div>
                        <div className="text-xs text-slate-500">{o.orderDate ? new Date(o.orderDate).toLocaleString() : ""}</div>
                      </div>
                      <div className="text-sm text-slate-600">{o.status || "Pending"}</div>
                    </div>

                    <div className="mt-3">
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${pct}%`,
                            background: pct === 100 ? "linear-gradient(90deg,#16a34a,#059669)" : "#10b981",
                          }}
                        />
                      </div>
                      <div className="mt-1 text-xs text-slate-500">{pct === 100 ? "Delivered" : `${pct}% complete`}</div>
                    </div>

                    <div className="mt-3 text-sm text-slate-700">
                      {Array.isArray(o.items) && o.items.length ? (
                        <div className="space-y-2">
                          {o.items.map((it, idx) => (
                            <div key={idx} className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-slate-100 rounded overflow-hidden">
                                  {it.image ? <img src={it.image} alt={it.name} className="w-full h-full object-cover" /> : <div className="text-xs text-slate-400 p-2">No img</div>}
                                </div>
                                <div>
                                  <div className="font-medium text-slate-800">{it.name || it.productName}</div>
                                  <div className="text-xs text-slate-500">Qty: {it.quantity || 1}</div>
                                </div>
                              </div>
                              <div className="text-sm text-slate-600">{fmt((it.price ?? 0) * (it.quantity ?? 1))}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-slate-400 text-sm">No items</div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-slate-400 text-sm">No orders yet</div>
            )}
          </div>
        </section>

        <section className="bg-white rounded-xl p-4 shadow-sm border">
          <h3 className="font-semibold text-slate-800">Shipping summary</h3>
          <div className="mt-3">
            {latestOrder ? (
              <>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-700">Latest: Order #{latestOrder.id}</div>
                  <div className="text-sm text-slate-600">{latestOrder.status || "Pending"}</div>
                </div>

                <div className="mt-3">
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-3 rounded-full transition-all duration-500"
                      style={{
                        width: `${statusToPercent(latestOrder.status)}%`,
                        background: statusToPercent(latestOrder.status) === 100 ? "linear-gradient(90deg,#16a34a,#059669)" : "#10b981",
                      }}
                    />
                  </div>
                  <div className="mt-1 text-xs text-slate-500">{statusToPercent(latestOrder.status) === 100 ? "Delivered" : `${statusToPercent(latestOrder.status)}% complete`}</div>
                </div>

                <div className="mt-3 text-sm text-slate-700">Total: {fmt(latestOrder.totalAmount)}</div>
              </>
            ) : (
              <div className="text-slate-400 text-sm">No shipments yet</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}