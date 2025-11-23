import React, { useEffect, useState } from "react";

// API Base URL
import { API_BASE } from '../../services/api';

const STATUS_OPTIONS = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [usersMap, setUsersMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [updating, setUpdating] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const eqId = (a, b) => String(a) === String(b);

  // Load orders + users
  useEffect(() => {
    let mounted = true;

    async function loadAll() {
      setLoading(true);
      setError("");

      try {
        const [ordersRes, usersRes] = await Promise.all([
          fetch(`${API_BASE}/orders`),
          fetch(`${API_BASE}/users`),
        ]);

        if (!mounted) return;

        const ordersData = ordersRes.ok ? await ordersRes.json() : [];
        const usersData = usersRes.ok ? await usersRes.json() : [];

        const map = {};
        usersData.forEach((u) => (map[String(u.id)] = u));

        setUsersMap(map);
        setOrders(Array.isArray(ordersData) ? ordersData : []);
      } catch (err) {
        console.error("[orders] loadAll failed:", err);
        setError("Unable to load orders. Check server or network.");
        setOrders([]);
        setUsersMap({});
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadAll();
    return () => {
      mounted = false;
    };
  }, []);

  // Refresh helper
  const refresh = async () => {
    setLoading(true);
    setError("");

    try {
      const [ordersRes, usersRes] = await Promise.all([
        fetch(`${API_BASE}/orders`),
        fetch(`${API_BASE}/users`),
      ]);

      const ordersData = ordersRes.ok ? await ordersRes.json() : [];
      const usersData = usersRes.ok ? await usersRes.json() : [];

      const map = {};
      usersData.forEach((u) => (map[String(u.id)] = u));

      setUsersMap(map);
      setOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (err) {
      console.error("[orders] refresh failed:", err);
      setError("Unable to refresh orders.");
    } finally {
      setLoading(false);
    }
  };

  // Helpers: customer name + order total
  const displayCustomer = (o) => {
    if (o.shippingDetails?.name) return o.shippingDetails.name;
    return usersMap[String(o.userId)]?.name || "—";
  };

  const displayTotal = (o) => {
    if (o.totalAmount !== undefined) return `₹${o.totalAmount}`;
    if (o.total !== undefined) return `₹${o.total}`;

    if (Array.isArray(o.items)) {
      const sum = o.items.reduce(
        (acc, item) => acc + (item.price || 0) * (item.quantity || 1),
        0
      );
      return `₹${sum}`;
    }
    return "—";
  };

  // Update Order Status
  async function updateOrderStatus(orderId, newStatus) {
    if (!window.confirm(`Change status to "${newStatus}"?`)) return;

    const targetId = String(orderId);
    setUpdating(orderId);

    const prevOrders = orders;
    // Optimistic update for UI
    setOrders((prev) => prev.map((o) => (eqId(o.id, targetId) ? { ...o, status: newStatus } : o)));

    try {
      // 1. Update /orders/:id
      const res = await fetch(`${API_BASE}/orders/${encodeURIComponent(targetId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error(`PATCH /orders failed: ${res.status}`);

      // 2. Update order inside /users/:userId (Sync)
      const orderToUpdate = orders.find((o) => eqId(o.id, targetId));
      if (orderToUpdate && orderToUpdate.userId) {
        const user = usersMap[String(orderToUpdate.userId)];
        if (user && Array.isArray(user.orders)) {
          const updatedUserOrders = user.orders.map((o) =>
            eqId(o.id, targetId) ? { ...o, status: newStatus } : o
          );

          await fetch(`${API_BASE}/users/${encodeURIComponent(user.id)}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orders: updatedUserOrders }),
          });
        }
      }

      await refresh();
    } catch (err) {
      console.error("[orders] updateOrderStatus failed:", err);
      alert("Failed to update order status.");
      setOrders(prevOrders);
    } finally {
      setUpdating(null);
    }
  }

  // Delete Order
  async function deleteOrder(orderId) {
    if (!window.confirm("Delete this order permanently?")) return;

    const targetId = String(orderId);
    setDeleting(orderId);

    const prevOrders = orders;
    setOrders((prev) => prev.filter((o) => !eqId(o.id, targetId)));

    try {
      // 1. Delete from /orders/:id
      const res = await fetch(`${API_BASE}/orders/${encodeURIComponent(targetId)}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error(`DELETE /orders failed: ${res.status}`);

      // 2. Remove from /users/:userId (Sync)
      const orderToDelete = orders.find((o) => eqId(o.id, targetId));
      if (orderToDelete && orderToDelete.userId) {
        const user = usersMap[String(orderToDelete.userId)];
        if (user && Array.isArray(user.orders)) {
          const updatedUserOrders = user.orders.filter((o) => !eqId(o.id, targetId));

          await fetch(`${API_BASE}/users/${encodeURIComponent(user.id)}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orders: updatedUserOrders }),
          });
        }
      }

      await refresh();
    } catch (err) {
      console.error("[orders] deleteOrder failed:", err);
      alert("Failed to delete the order.");
      setOrders(prevOrders);
    } finally {
      setDeleting(null);
    }
  }

  // UI rendering
  return (
    <div>
      {/* Header */}
      <header className="mb-6 flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-semibold text-slate-800">Orders</h2>
          <p className="text-sm text-slate-500">Recent orders and their status</p>
        </div>

        <button
          onClick={refresh}
          className="px-3 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 shadow"
        >
          Refresh
        </button>
      </header>

      {/* Table Container */}
      <div className="bg-white border p-5 rounded-2xl overflow-hidden shadow-xl border-emerald-100/20 bg-gradient-to-b from-emerald-100 to-white">
        <div className="overflow-x-auto rounded-2xl">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Order ID</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Customer</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Date</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Total</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Items</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Actions</th>
              </tr>
            </thead>

            <tbody>
              {/* Loading / Error / Empty / Data */}
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center p-8 text-slate-500">
                    Loading...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="7" className="text-center p-8 text-red-600">
                    {error}
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center p-8 text-slate-500">
                    No orders
                  </td>
                </tr>
              ) : (
                Array.isArray(orders) && orders.map((order) => (
                  <React.Fragment key={order.id}>
                    <tr className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-700">#{order.id}</td>
                      <td className="px-4 py-3 text-slate-600">{displayCustomer(order)}</td>
                      <td className="px-4 py-3 text-slate-500">
                        {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-4 py-3 font-medium text-emerald-600">{displayTotal(order)}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${order.status === "Delivered"
                            ? "bg-emerald-100 text-emerald-700"
                            : order.status === "Cancelled"
                              ? "bg-red-100 text-red-700"
                              : order.status === "Shipped"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                        >
                          {order.status || "Pending"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        <button
                          onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                          className="text-emerald-600 hover:underline text-xs"
                        >
                          {expanded === order.id ? "Hide Items" : "View Items"}
                        </button>
                      </td>
                      <td className="px-4 py-3 flex items-center gap-2">
                        <select
                          value={order.status || "Pending"}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          disabled={updating === order.id}
                          className="text-xs border rounded px-2 py-1 bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                        >
                          {STATUS_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => deleteOrder(order.id)}
                          disabled={deleting === order.id}
                          className="text-red-500 hover:text-red-700 text-xs font-medium"
                        >
                          {deleting === order.id ? "..." : "Delete"}
                        </button>
                      </td>
                    </tr>
                    {expanded === order.id && (
                      <tr className="bg-slate-50">
                        <td colSpan="7" className="px-4 py-3">
                          <div className="space-y-2">
                            {Array.isArray(order.items) && order.items.length > 0 ? (
                              order.items.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between text-xs text-slate-600 border-b border-slate-200 pb-2 last:border-0 last:pb-0">
                                  <div className="flex items-center gap-2">
                                    {item.image && (
                                      <img src={item.image} alt={item.name} className="w-8 h-8 object-cover rounded" />
                                    )}
                                    <span>{item.name} (x{item.quantity})</span>
                                  </div>
                                  <span>₹{(item.price || 0) * (item.quantity || 1)}</span>
                                </div>
                              ))
                            ) : (
                              <div className="text-slate-400 text-xs">No items details</div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}