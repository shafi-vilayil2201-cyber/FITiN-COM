import React, { useEffect, useState } from "react";
import { getAllOrders, updateOrderStatus } from "../../services/api";

const STATUS_OPTIONS = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [updating, setUpdating] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAllOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("[orders] fetch failed:", err);
      setError("Unable to load orders. Check server or network.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const displayTotal = (o) => {
    if (o.totalAmount !== undefined) return `₹${o.totalAmount}`;
    return "—";
  };

  async function handleStatusChange(orderId, newStatus) {
    if (!window.confirm(`Change status to "${newStatus}"?`)) return;

    setUpdating(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      await fetchOrders();
    } catch (err) {
      console.error("[orders] updateOrderStatus failed:", err);
      alert("Failed to update order status.");
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div>
      {/* Header */}
      <header className="mb-6 flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-semibold text-slate-800">Orders</h2>
          <p className="text-sm text-slate-500">Recent orders and their status</p>
        </div>
        <button
          onClick={fetchOrders}
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
                <th className="px-4 py-3 text-left font-medium text-slate-600">Date</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Total</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Items</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center p-8 text-slate-500">Loading...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="6" className="text-center p-8 text-red-600">{error}</td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center p-8 text-slate-500">No orders</td>
                </tr>
              ) : (
                orders.map((order) => (
                  <React.Fragment key={order.orderId}>
                    <tr className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-700">#{String(order.orderId).slice(0, 8)}</td>
                      <td className="px-4 py-3 text-slate-500">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "—"}
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
                          onClick={() => setExpanded(expanded === order.orderId ? null : order.orderId)}
                          className="text-emerald-600 hover:underline text-xs"
                        >
                          {expanded === order.orderId ? "Hide Items" : "View Items"}
                        </button>
                      </td>
                      <td className="px-4 py-3 flex items-center gap-2">
                        <select
                          value={order.status || "Pending"}
                          onChange={(e) => handleStatusChange(order.orderId, e.target.value)}
                          disabled={updating === order.orderId}
                          className="text-xs border rounded px-2 py-1 bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                        >
                          {STATUS_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                    {expanded === order.orderId && (
                      <tr className="bg-slate-50">
                        <td colSpan="6" className="px-4 py-3">
                          <div className="space-y-2">
                            {Array.isArray(order.items) && order.items.length > 0 ? (
                              order.items.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between text-xs text-slate-600 border-b border-slate-200 pb-2 last:border-0 last:pb-0">
                                  <span>{item.productName} (x{item.quantity})</span>
                                  <span>₹{item.unitPrice} × {item.quantity} = ₹{item.totalPrice}</span>
                                </div>
                              ))
                            ) : (
                              <div className="text-slate-400 text-xs">No item details</div>
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
