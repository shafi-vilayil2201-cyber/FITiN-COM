import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import {
  FaBoxOpen,
  FaShoppingCart,
  FaUsers,
  FaChartLine,
  FaSyncAlt,
  FaArrowUp,
  FaArrowDown
} from "react-icons/fa";
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
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

import { adminGetUsers, getAllProducts, getAllOrders } from '../../services/api';

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [chartData, setChartData] = useState(null);
  const [rangeDays, setRangeDays] = useState(7);
  const chartRef = useRef(null);

  const deriveOrdersFromUsers = (usersArr) => {
    const all = [];
    for (const u of (usersArr || [])) {
      if (Array.isArray(u.orders)) {
        for (const o of u.orders) {
          all.push({
            ...o,
            userId: u.id,
            userName: u.name || u.email || "Unknown",
          });
        }
      }
    }
    return all.sort((a, b) => new Date(b.createdAt || b.orderDate) - new Date(a.createdAt || a.orderDate));
  };

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [pData, uData, oResData] = await Promise.all([
        getAllProducts(),
        adminGetUsers(),
        getAllOrders(),
      ]);

      let oData = oResData || [];

      if (!oData.length && uData?.length) {
        oData = deriveOrdersFromUsers(uData);
      }

      setProducts(Array.isArray(pData) ? pData : []);
      setUsers(Array.isArray(uData) ? uData : []);
      setOrders(Array.isArray(oData) ? oData : []);
    } catch (err) {
      console.error("Dashboard load error:", err);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    if (!orders.length) {
      setChartData(null);
      return;
    }

    const labels = [];
    const revenue = [];
    const now = new Date();

    for (let i = rangeDays - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      labels.push(d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }));

      const dayTotal = orders
        .filter(o => (o.createdAt || o.orderDate)?.startsWith(dateStr) && o.status !== 'Cancelled')
        .reduce((sum, o) => sum + (o.totalAmount || o.total || 0), 0);
      revenue.push(dayTotal);
    }

    setChartData({
      labels,
      datasets: [{
        label: "Revenue",
        data: revenue,
        fill: true,
        borderColor: "#059669",
        backgroundColor: "rgba(5, 150, 105, 0.1)",
        tension: 0.4,
        borderWidth: 3,
        pointRadius: 4,
        pointBackgroundColor: "#fff",
        pointBorderColor: "#059669",
        pointBorderWidth: 2,
        pointHoverRadius: 6,
      }]
    });
  }, [orders, rangeDays]);

  const stats = [
    { label: "Total Products", value: products.length, icon: <FaBoxOpen />, color: "emerald", trend: "+12%" },
    { label: "Active Orders", value: orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length, icon: <FaShoppingCart />, color: "blue", trend: "+5%" },
    { label: "Customers", value: users.length, icon: <FaUsers />, color: "indigo", trend: "+18%" },
    { label: "Total Revenue", value: `₹${Math.round(orders.reduce((s, o) => s + (o.totalAmount || o.total || 0), 0)).toLocaleString()}`, icon: <FaChartLine />, color: "teal", trend: "+24%" },
  ];

  if (loading && !products.length) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <FaSyncAlt className="animate-spin text-emerald-600 text-3xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Overview</h1>
          <p className="text-slate-500 font-medium">Real-time performance metrics</p>
        </div>
        <button
          onClick={loadAll}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-emerald-600 hover:border-emerald-100 transition-all shadow-sm font-bold text-sm"
        >
          <FaSyncAlt className={loading ? "animate-spin" : ""} />
          <span>Refresh Data</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 font-bold text-sm flex items-center gap-3">
          <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-${stat.color}-50 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110`} />
            <div className="relative z-10">
              <div className={`w-12 h-12 bg-${stat.color}-50 text-${stat.color}-600 rounded-2xl flex items-center justify-center mb-4 text-xl shadow-sm border border-${stat.color}-100`}>
                {stat.icon}
              </div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-black text-slate-900">{stat.value}</h3>
                <span className={`text-[10px] font-black p-1 rounded-lg ${stat.trend.startsWith('+') ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>
                  {stat.trend}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Column */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-slate-900">Revenue Growth</h3>
              <p className="text-slate-400 text-sm font-medium">Daily revenue insights</p>
            </div>
            <select
              value={rangeDays}
              onChange={(e) => setRangeDays(Number(e.target.value))}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-600 focus:outline-emerald-500"
            >
              <option value={7}>Last 7 Days</option>
              <option value={14}>Last 14 Days</option>
              <option value={30}>Last 30 Days</option>
            </select>
          </div>
          <div className="h-[300px]">
            {chartData ? (
              <Line
                ref={chartRef}
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      backgroundColor: '#1e293b',
                      padding: 12,
                      titleFont: { size: 14, weight: 'bold' },
                      bodyFont: { size: 13 },
                      cornerRadius: 12,
                      displayColors: false,
                      callbacks: {
                        label: (ctx) => ` ₹${ctx.parsed.y.toLocaleString()}`
                      }
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: { color: '#f1f5f9' },
                      border: { display: false },
                      ticks: { font: { weight: 'bold' }, color: '#94a3b8', callback: (v) => '₹' + v }
                    },
                    x: {
                      grid: { display: false },
                      border: { display: false },
                      ticks: { font: { weight: 'bold' }, color: '#94a3b8' }
                    }
                  }
                }}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 font-medium italic">
                No revenue data for this range
              </div>
            )}
          </div>
        </div>

        {/* Recent Orders Column */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-50">
            <h3 className="text-xl font-black text-slate-900">Recent Orders</h3>
            <p className="text-slate-400 text-sm font-medium">Latest customer activity</p>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="divide-y divide-slate-50">
              {orders.slice(0, 5).map((order) => (
                <div key={order.orderId} className="p-6 hover:bg-slate-50 transition-colors flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm font-black shadow-xs">
                    {String(order.userName || "U").charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 truncate">{order.userName || "Customer"}</p>
                    <p className="text-xs text-slate-400 font-medium tracking-tight">#{String(order.orderId).slice(-8).toUpperCase()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-slate-900">₹{Math.round(order.totalAmount || order.total || 0).toLocaleString()}</p>
                    <span className={`text-[9px] font-black uppercase tracking-widest ${order.status === 'Completed' ? 'text-emerald-500' : 'text-amber-500'}`}>
                      {order.status || 'Pending'}
                    </span>
                  </div>
                </div>
              ))}
              {orders.length === 0 && (
                <div className="p-12 text-center text-slate-400 italic">No orders found</div>
              )}
            </div>
          </div>
          <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
            <a href="#/admin/orders" className="text-xs font-black text-emerald-600 uppercase tracking-widest hover:text-emerald-700 transition-colors">
              View All Orders
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}