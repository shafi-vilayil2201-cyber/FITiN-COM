import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import {
  FaSearch,
  FaEye,
  FaTimes,
  FaShippingFast,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaBox,
  FaUser
} from "react-icons/fa";
import { getAllOrders, updateOrderStatus } from '../../services/api';

export default function OrdersAdmin() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const loadAll = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrder?.orderId === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }
      toast.success(`Order marked as ${newStatus}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = orders.filter(o =>
    String(o.orderId).toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(o.userName || o.customer || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Completed':
      case 'Delivered':
        return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Cancelled':
      case 'Failed':
        return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'Processing':
        return 'bg-blue-50 text-blue-600 border-blue-100';
      default:
        return 'bg-amber-50 text-amber-600 border-amber-100';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Orders</h1>
          <p className="text-slate-500 font-medium">Monitor and manage customer purchases</p>
        </div>
        <div className="relative group">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none w-64"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Order ID</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Customer</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Amount</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Date</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                [1, 2, 3].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-6"><div className="h-4 bg-slate-100 rounded w-20"></div></td>
                    <td className="px-6 py-6"><div className="h-4 bg-slate-100 rounded w-32"></div></td>
                    <td className="px-6 py-6"><div className="h-4 bg-slate-100 rounded w-16 mx-auto"></div></td>
                    <td className="px-6 py-6"><div className="h-6 bg-slate-100 rounded-full w-24 mx-auto"></div></td>
                    <td className="px-6 py-6"><div className="h-4 bg-slate-100 rounded w-24 mx-auto"></div></td>
                    <td className="px-6 py-6"><div className="h-4 bg-slate-100 rounded w-10 ml-auto"></div></td>
                  </tr>
                ))
              ) : filtered.map((order) => (
                <tr key={order.orderId} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs font-bold text-slate-400">#{String(order.orderId).slice(-8).toUpperCase()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 text-xs font-bold">
                        {String(order.userName || order.customer || "U").charAt(0).toUpperCase()}
                      </div>
                      <span className="font-bold text-slate-700">{order.userName || order.customer || "Guest"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center font-black text-slate-900">
                    ₹{Math.round(order.totalAmount || order.total || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-transparent shadow-sm ${getStatusStyle(order.status)}`}>
                      {order.status || "Pending"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-xs font-bold text-slate-400">
                    {(order.createdAt || order.orderDate)?.split('T')[0]}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                    >
                      <FaEye />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setSelectedOrder(null)} />
          <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-full max-h-[800px] border border-slate-100">
            {/* Modal Left: Details */}
            <div className="flex-1 p-8 overflow-y-auto custom-scrollbar space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Order Details</h3>
                  <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">#{selectedOrder.orderId}</p>
                  <p className="text-slate-400 text-[10px] font-black uppercase mt-1 bg-slate-50 inline-block px-2 py-0.5 rounded-md border border-slate-100">
                    Placed on: {new Date(selectedOrder.orderDate || selectedOrder.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>

                </div>
                <button onClick={() => setSelectedOrder(null)} className="md:hidden p-2 text-slate-400">
                  <FaTimes />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-3 mb-2 text-emerald-600">
                    <FaUser />
                    <span className="text-xs font-black uppercase tracking-widest">Customer Info</span>
                  </div>
                  <p className="font-bold text-slate-900">{selectedOrder.userName || selectedOrder.shippingName || "Customer"}</p>
                  <div className="text-sm text-slate-500 mt-1 space-y-0.5">
                    <p>{selectedOrder.shippingAddress || "No address provided"}</p>
                    {(selectedOrder.shippingCity || selectedOrder.shippingPostalCode) && (
                      <p>{selectedOrder.shippingCity}{selectedOrder.shippingCity && selectedOrder.shippingPostalCode ? ', ' : ''}{selectedOrder.shippingPostalCode}</p>
                    )}
                    {selectedOrder.shippingPhone && (
                      <p className="text-xs font-medium text-slate-400 mt-1">📞 {selectedOrder.shippingPhone}</p>
                    )}
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-3 mb-2 text-emerald-600">
                    <FaShippingFast />
                    <span className="text-xs font-black uppercase tracking-widest">Order Status</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black shadow-sm ${getStatusStyle(selectedOrder.status)}`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Items Summary</h4>
                <div className="space-y-3">
                  {(selectedOrder.items || []).map((item, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl group hover:shadow-md transition-all">
                      <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-100">
                        {item.productImageUrl ? (
                          <img src={item.productImageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300 italic text-[10px]">No Image</div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-slate-900">{item.productName || "Product"}</p>
                        <p className="text-xs text-slate-500 font-medium">Qty: {item.quantity} × ₹{item.price || item.unitPrice}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-slate-900">₹{((item.price || item.unitPrice) * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Right: Actions */}
            <div className="w-full md:w-80 bg-slate-50 p-8 border-l border-slate-100 flex flex-col justify-between">
              <div>
                <div className="hidden md:flex justify-end mb-8">
                  <button onClick={() => setSelectedOrder(null)} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white text-slate-400 transition-all border border-transparent hover:border-slate-200">
                    <FaTimes />
                  </button>
                </div>

                <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Manage Order</h4>

                <div className="space-y-3">
                  {['Pending', 'Processing', 'Delivered', 'Cancelled'].map(status => (
                    <button
                      key={status}
                      disabled={updatingId === selectedOrder.orderId || selectedOrder.status === status}
                      onClick={() => handleUpdateStatus(selectedOrder.orderId, status)}
                      className={`w-full py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all text-left flex items-center justify-between group
                        ${selectedOrder.status === status
                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          : 'bg-white text-slate-700 hover:bg-emerald-600 hover:text-white shadow-sm'
                        }
                      `}
                    >
                      <span>{status}</span>
                      {selectedOrder.status === status && <FaCheckCircle className="text-emerald-500" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-8 border-t border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-400">Total Amount</span>
                </div>
                <div className="text-3xl font-black text-slate-900">
                  ₹{Math.round(selectedOrder.totalAmount || selectedOrder.total || 0).toLocaleString()}
                </div>
                <p className="text-[10px] text-slate-400 mt-2 font-bold italic">Inclusive of all taxes & shipping</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
