import React, { useEffect, useState } from "react";

/* ----------------------------------------------------------
   BASE URL (Production uses Vercel ENV → VITE_API_BASE)
   Development uses localhost automatically.
---------------------------------------------------------- */
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

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

  /* ----------------------------------------------------------
     Load orders + users
  ---------------------------------------------------------- */
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

  /* ----------------------------------------------------------
     Refresh helper
  ---------------------------------------------------------- */
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

  /* ----------------------------------------------------------
     Helpers: customer name + order total
  ---------------------------------------------------------- */
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

  /* ----------------------------------------------------------
     Update Order Status
  ---------------------------------------------------------- */
  async function updateOrderStatus(orderId, newStatus) {
    if (!window.confirm(`Change status to "${newStatus}"?`)) return;

    const targetId = String(orderId);
    setUpdating(orderId);

    const prevOrders = orders;
    setOrders((prev) => prev.map((o) => (eqId(o.id, targetId) ? { ...o, status: newStatus } : o)));

    try {
      const res = await fetch(`${API_BASE}/orders/${encodeURIComponent(targetId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error(`PATCH failed: ${res.status}`);
      await refresh();
    } catch (err) {
      console.error("[orders] updateOrderStatus failed:", err);
      alert("Failed to update order status.");
      setOrders(prevOrders);
    } finally {
      setUpdating(null);
    }
  }

  /* ----------------------------------------------------------
     Delete Order
  ---------------------------------------------------------- */
  async function deleteOrder(orderId) {
    if (!window.confirm("Delete this order permanently?")) return;

    const targetId = String(orderId);
    setDeleting(orderId);

    const prevOrders = orders;
    setOrders((prev) => prev.filter((o) => !eqId(o.id, targetId)));

    try {
      const res = await fetch(`${API_BASE}/orders/${encodeURIComponent(targetId)}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error(`DELETE failed: ${res.status}`);
      await refresh();
    } catch (err) {
      console.error("[orders] deleteOrder failed:", err);
      alert("Failed to delete the order.");
      setOrders(prevOrders);
    } finally {
      setDeleting(null);
    }
  }

  /* ----------------------------------------------------------
     UI rendering
  ---------------------------------------------------------- */
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
            <thead className="bg-slate-50">{/* table header */}</thead>

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
                orders.map(/* ...same mapping logic... */)
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}