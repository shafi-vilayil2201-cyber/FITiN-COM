import React, { useEffect, useState, useRef, useMemo } from "react";
import { FaBoxOpen, FaShoppingCart, FaUsers, FaChartLine, FaSyncAlt, FaPlay } from "react-icons/fa";
import { Line } from "react-chartjs-2";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale
);

/* Use environment variable for production; fallback to localhost in dev */
import { API_BASE } from '../../services/api';

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [chartData, setChartData] = useState(null);

  const chartRef = useRef(null);
  const loadAllRef = useRef(null);
  const [rangeDays, setRangeDays] = useState(7);
  const [isAnimating, setIsAnimating] = useState(false);
  const [chartKey, setChartKey] = useState(0);

  async function loadAll() {
    setLoading(true);
    setError("");

    try {
      const [pRes, uRes] = await Promise.all([
        fetch(`${API_BASE}/products`),
        fetch(`${API_BASE}/users`),
      ]);

      if (!pRes.ok) throw new Error("Failed to fetch products");
      if (!uRes.ok) throw new Error("Failed to fetch users");
      const [pData, uData] = await Promise.all([pRes.json(), uRes.json()]);

      setProducts(Array.isArray(pData) ? pData : []);
      setUsers(Array.isArray(uData) ? uData : []);

      try {
        const oRes = await fetch(`${API_BASE}/orders`);
        if (oRes.ok) {
          const oData = await oRes.json();
          setOrders(Array.isArray(oData) ? oData : []);
        } else {
          const derived = deriveOrdersFromUsers(uData || []);
          setOrders(derived);
        }
      } catch (err) {
        const derived = deriveOrdersFromUsers(uData || []);
        setOrders(derived);
      }
    } catch (err) {
      console.error("Dashboard load error:", err);
      setError("Failed to load dashboard data.");

      try {
        const pRes = await fetch(`${API_BASE}/products`);
        if (pRes.ok) {
          const pData = await pRes.json();
          setProducts(Array.isArray(pData) ? pData : []);
        }
      } catch { }

      try {
        const uRes = await fetch(`${API_BASE}/users`);
        if (uRes.ok) {
          const uData = await uRes.json();
          setUsers(Array.isArray(uData) ? uData : []);
          const derived = deriveOrdersFromUsers(uData || []);
          setOrders(derived);
        }
      } catch { }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAllRef.current = loadAll;
  }, []);

  useEffect(() => {
    let mounted = true;
    if (mounted) loadAll();
    return () => (mounted = false);
  }, []);

  useEffect(() => {
    if (!Array.isArray(orders) || orders.length === 0) {
      setChartData(null);
      return;
    }

    const days = Number(rangeDays) || 7;
    const labels = [];
    const revenueMap = {};
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      labels.push(key);
      revenueMap[key] = 0;
    }

    for (const o of orders) {
      let dateKey = null;
      if (o.orderDate) {
        try {
          dateKey = new Date(o.orderDate).toISOString().slice(0, 10);
        } catch { }
      }
      if (!dateKey && o.createdAt) {
        try {
          dateKey = new Date(o.createdAt).toISOString().slice(0, 10);
        } catch { }
      }
      if (!dateKey) continue;
      if (!(dateKey in revenueMap)) continue;

      let val = 0;
      if (o.totalAmount !== undefined) val = Number(o.totalAmount) || 0;
      else if (o.total !== undefined) val = Number(o.total) || 0;
      else if (o.items && Array.isArray(o.items)) {
        let sum = 0;
        for (const it of o.items) {
          const p = Number(it.price) || 0;
          const q = Number(it.quantity) || 0;
          sum += p * q;
        }
        val = sum;
      }
      revenueMap[dateKey] += val;
    }

    const labelsFormatted = labels.map((l) => {
      const d = new Date(l + "T00:00:00");
      return d.toLocaleDateString(undefined, { day: "2-digit", month: "short" });
    });

    const values = labels.map((l) => Math.round(revenueMap[l] || 0));

    const palette = [
      "#065f46",
      "#059669",
      "#10b981",
      "#34d399",
      "#60a5fa",
      "#f59e0b",
      "#f97316",
    ];
    const pointBackgroundColor = values.map((_, idx) => palette[idx % palette.length]);

    setChartData({
      labels: labelsFormatted,
      rawLabels: labels,
      datasets: [
        {
          label: "Revenue (₹)",
          data: values,
          fill: true,
          tension: 0.3,
          borderWidth: 2,
          borderColor: "rgba(6,95,70,0.95)",
          backgroundColor: (context) => {
            return "rgba(6,95,70,0.12)";
          },
          pointRadius: 4,
          pointBackgroundColor,
          pointHoverRadius: 6,
        },
      ],
    });
  }, [orders, rangeDays]);

  useEffect(() => {
    if (!chartRef.current || !chartData) return;

    const chartInstance = chartRef.current;
    const ctx = chartInstance?.ctx || chartInstance?.canvas?.getContext?.("2d");
    const canvas = chartInstance?.canvas || chartInstance?.ctx?.canvas;

    if (!ctx || !canvas) return;

    const height = canvas.height || 200;
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "rgba(6,95,70,0.75)");
    gradient.addColorStop(0.5, "rgba(16,185,129,0.35)");
    gradient.addColorStop(1, "rgba(96,165,250,0.08)");

    const newData = {
      ...chartData,
      datasets: chartData.datasets.map((ds) => ({
        ...ds,
        backgroundColor: gradient,
      })),
    };
    setChartData(newData);
  }, [chartKey, chartRef.current, chartData?.labels?.length]);

  function deriveOrdersFromUsers(usersArr) {
    const all = [];
    for (const u of usersArr) {
      if (Array.isArray(u.orders)) {
        for (const o of u.orders) {
          const order = {
            ...o,
            userId: u.id,
            userName: u.name || u.email || "Unknown",
          };
          all.push(order);
        }
      }
    }
    all.sort((a, b) => {
      const ta = a.orderDate ? Date.parse(a.orderDate) : 0;
      const tb = b.orderDate ? Date.parse(b.orderDate) : 0;
      return tb - ta;
    });
    return all;
  }

  const totalOrders = Array.isArray(orders) ? orders.length : 0;
  const totalProducts = Array.isArray(products) ? products.length : 0;
  const totalCustomers = Array.isArray(users) ? users.length : 0;

  const totalRevenue = (() => {
    if (!Array.isArray(orders)) return 0;
    let acc = 0;
    for (const o of orders) {
      let val = 0;
      if (o.totalAmount !== undefined) val = Number(o.totalAmount) || 0;
      else if (o.total !== undefined) val = Number(o.total) || 0;
      else if (o.items && Array.isArray(o.items)) {
        let sum = 0;
        for (const it of o.items) {
          const p = Number(it.price) || 0;
          const q = Number(it.quantity) || 0;
          sum += p * q;
        }
        val = sum;
      }
      acc += val;
    }
    return acc;
  })();

  const recentOrders = Array.isArray(orders) ? orders.slice(0, 5) : [];

  const stats = [
    {
      id: 1,
      label: "Total Orders",
      value: totalOrders.toLocaleString(),
      icon: <FaShoppingCart className="w-5 h-5" />,
    },
    { id: 2, label: "Products", value: totalProducts.toLocaleString(), icon: <FaBoxOpen className="w-5 h-5" /> },
    { id: 3, label: "Customers", value: totalCustomers.toLocaleString(), icon: <FaUsers className="w-5 h-5" /> },
    {
      id: 4,
      label: "Revenue",
      value: `₹${Math.round(totalRevenue).toLocaleString()}`,
      icon: <FaChartLine className="w-5 h-5" />,
    },
  ];

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 1200,
        easing: "easeOutBounce",
      },
      plugins: {
        legend: { display: false },
        title: { display: false },
        tooltip: { mode: "index", intersect: false },
      },
      scales: {
        x: { grid: { display: false } },
        y: { ticks: { beginAtZero: true, callback: (v) => (v >= 1000 ? `${v / 1000}k` : v) } },
      },
      elements: {
        line: {
          borderJoinStyle: "round",
        },
      },
    }),
    []
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-800">Dashboard</h2>
          <p className="text-sm text-slate-500">Overview of store performance</p>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <div className="inline-flex items-center rounded-md bg-white border border-slate-200 shadow-sm px-2 py-1">
            <button
              onClick={() => setRangeDays(7)}
              className={`px-2 py-1 text-sm rounded ${rangeDays === 7 ? "bg-emerald-500 text-white" : "text-slate-700"}`}
            >
              7d
            </button>
            <button
              onClick={() => setRangeDays(14)}
              className={`px-2 py-1 text-sm rounded ${rangeDays === 14 ? "bg-emerald-500 text-white" : "text-slate-700"}`}
            >
              14d
            </button>
            <button
              onClick={() => setRangeDays(30)}
              className={`px-2 py-1 text-sm rounded ${rangeDays === 30 ? "bg-emerald-500 text-white" : "text-slate-700"}`}
            >
              30d
            </button>
          </div>

          <button
            title="Refresh"
            onClick={() => {
              if (loadAllRef.current) loadAllRef.current();
            }}
            className="inline-flex items-center px-3 py-2 rounded-lg bg-white border border-slate-200 shadow-sm text-sm text-slate-700 hover:shadow-md hover:bg-slate-50 transition-all duration-150"
          >
            <FaSyncAlt className="mr-2" /> Refresh
          </button>

          <button
            className="inline-flex items-center px-4 py-2 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-medium border border-emerald-100"
            onClick={() => (window.location.href = "/admin/products")}
          >
            Add product
          </button>
        </div>
      </div>

      {error && <div className="rounded-md bg-rose-50 text-rose-700 p-3 text-sm border border-rose-100">{error}</div>}
      {loading && <div className="text-slate-500 text-sm">Loading dashboard…</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div
            key={s.id}
            className={`rounded-xl p-4 shadow-inner border border-emerald-100/20 bg-linear-to-b from-emerald-200 to-white group transform transition-all duration-200 ${isAnimating ? "animate-bounce" : "hover:-translate-y-1"
              } hover:shadow-lg`}
          >
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-500">{s.label}</div>
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/70 transition-colors duration-200 group-hover:bg-emerald-100">
                {s.icon}
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-semibold text-slate-800">{s.value}</div>
              <div className="text-xs text-slate-400 mt-1">vs last week +6%</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 ">
          <div className="bg-white rounded-2xl p-6 shadow-xl border-emerald-100/20 bg-linear-to-b from-emerald-200 to-white group transform transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-slate-800">Sales overview</h3>
              <div className="text-sm text-slate-500">Last {rangeDays} days</div>
            </div>

            <div className="mt-4">
              <div className="text-4xl font-bold text-slate-800">₹{Math.round(totalRevenue).toLocaleString()}</div>
              <div className="text-sm text-emerald-600 mt-1">Summary</div>
            </div>

            <div className="mt-4 w-full h-56 rounded-lg bg-linear-to-b from-emerald-50 to-white border border-emerald-100/30 flex items-center justify-center text-slate-400 transform transition-all duration-200 hover:shadow-md hover:scale-105">
              {chartData ? (
                <div className="w-full h-full" key={chartKey}>
                  <Line ref={chartRef} data={chartData} options={chartOptions} />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400">No chart data</div>
              )}
            </div>

            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-lg bg-emerald-100 p-3 text-center transform transition-all duration-150 hover:shadow hover:scale-105">
                <div className="text-sm text-slate-500">Avg. Order</div>
                <div className="mt-1 font-semibold text-slate-800">₹{totalOrders ? Math.round(totalRevenue / totalOrders).toLocaleString() : "0"}</div>
              </div>
              <div className="rounded-lg bg-emerald-100 p-3 text-center transform transition-all duration-150 hover:shadow hover:scale-105">
                <div className="text-sm text-slate-500">Conversion</div>
                <div className="mt-1 font-semibold text-slate-800">2.4%</div>
              </div>
              <div className="rounded-lg bg-emerald-100 p-3 text-center transform transition-all duration-150 hover:shadow hover:scale-105">
                <div className="text-sm text-slate-500">Sessions</div>
                <div className="mt-1 font-semibold text-slate-800">12.3k</div>
              </div>
              <div className="rounded-lg bg-emerald-100 p-3 text-center transform transition-all duration-150 hover:shadow hover:scale-105">
                <div className="text-sm text-slate-500">Return</div>
                <div className="mt-1 font-semibold text-slate-800">1.2%</div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="rounded-2xl p-4 bg-linear-to-b from-emerald-200 to-white shadow-inner border border-emerald-100/20">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-slate-800">Recent orders</h4>
              <button
                className="text-xs text-emerald-600 hover:text-emerald-700 hover:underline transition-colors duration-150"
                onClick={() => (window.location.href = "/admin/orders")}
              >
                View all
              </button>
            </div>

            <div className="space-y-3">
              {Array.isArray(recentOrders) && recentOrders.length > 0 ? (
                recentOrders.map((o) => {
                  const id = o.id ?? o.orderId ?? "—";
                  const name = o.userName || o.customer || (o.userId ? String(o.userId) : "Customer");

                  let total = o.totalAmount ?? o.total;
                  if (total === undefined && Array.isArray(o.items)) {
                    let sum = 0;
                    for (const it of o.items) {
                      const p = Number(it.price) || 0;
                      const q = Number(it.quantity) || 0;
                      sum += p * q;
                    }
                    total = sum;
                  }
                  total = total !== undefined ? `₹${Number(total).toLocaleString()}` : "—";
                  const status = o.status || "Pending";

                  return (
                    <div
                      key={String(id)}
                      className="flex items-center justify-between bg-white/60 rounded-lg p-3 border border-transparent transform transition-all duration-150 hover:bg-white/80 hover:shadow-md hover:-translate-y-1"
                    >
                      <div>
                        <div className="text-sm font-medium text-slate-800">{id}</div>
                        <div className="text-xs text-slate-500">{name}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-slate-800">{total}</div>
                        <div className="text-xs text-slate-500">{status}</div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-sm text-slate-500">No recent orders</div>
              )}
            </div>

            <div className="mt-4 text-xs text-slate-500">Showing last {recentOrders.length} orders</div>
          </div>
        </div>
      </div>
    </div>
  );
}