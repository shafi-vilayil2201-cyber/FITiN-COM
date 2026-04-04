import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import {
  FaSearch,
  FaUserShield,
  FaUserCheck,
  FaUserAltSlash,
  FaEye,
  FaSyncAlt,
  FaChevronLeft,
  FaChevronRight,
  FaShieldAlt
} from "react-icons/fa";
import { AuthContext, useAuth } from "../../contexts/AuthContext";
import { adminGetUsers, adminBlockUser, adminUnblockUser, adminGetUserDetails } from '../../services/api';

const PAGE_SIZE = 8;

export default function UsersAdmin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [page, setPage] = useState(1);
  const [updatingId, setUpdatingId] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminGetUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleBlock = async (user) => {
    const willBeBlocked = user.isActive; // If currently active, it will be blocked
    setUpdatingId(user.id);
    try {
      if (willBeBlocked) {
        await adminBlockUser(user.id);
      } else {
        await adminUnblockUser(user.id);
      }

      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isActive: !willBeBlocked } : u));
      if (selectedUser?.id === user.id) {
        setSelectedUser(prev => ({ ...prev, isActive: !willBeBlocked }));
      }
      toast.success(`User ${willBeBlocked ? 'blocked' : 'unblocked'}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update user status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSelectUser = async (user) => {
    setSelectedUser(user);
    setDetailsLoading(true);
    try {
      const details = await adminGetUserDetails(user.id);
      setSelectedUser(details);
    } catch (err) {
      console.error(err);
      toast.error("Could not load full user profile");
    } finally {
      setDetailsLoading(false);
    }
  };

  const filtered = users.filter(u =>
    (u.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginatedUsers = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Users</h1>
          <p className="text-slate-500 font-medium">Manage and moderate your community</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none w-64"
            />
          </div>
          <button
            onClick={fetchUsers}
            className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-emerald-600 hover:border-emerald-100 hover:bg-emerald-50 transition-all shadow-sm"
          >
            <FaSyncAlt className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Users List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">User</th>
                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Role</th>
                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    [1, 2, 3, 4].map(i => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-6 py-6"><div className="h-10 bg-slate-100 rounded-full w-40"></div></td>
                        <td className="px-6 py-6"><div className="h-4 bg-slate-100 rounded w-16"></div></td>
                        <td className="px-6 py-6"><div className="h-6 bg-slate-100 rounded-full w-20 mx-auto"></div></td>
                        <td className="px-6 py-6"><div className="h-8 bg-slate-100 rounded-lg w-20 ml-auto"></div></td>
                      </tr>
                    ))
                  ) : paginatedUsers.map((user) => (
                    <tr
                      key={user.id}
                      onClick={() => handleSelectUser(user)}
                      className={`hover:bg-slate-50/50 transition-colors cursor-pointer group ${selectedUser?.id === user.id ? 'bg-emerald-50/30' : ''}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-linear-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-500 font-bold border border-white shadow-sm">
                            {(user.name || user.email || "U").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 leading-none mb-1">{user.name || "Customer"}</p>
                            <p className="text-xs text-slate-400 font-medium">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter shadow-xs border 
                          ${(String(user.role).toLowerCase() === 'admin' || user.role === 2)
                            ? 'bg-indigo-50 text-indigo-600 border-indigo-100'
                            : 'bg-slate-50 text-slate-600 border-slate-100'}`}>
                          {user.role === 2 || String(user.role).toLowerCase() === 'admin' ? 'Admin' : 'User'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-transparent shadow-sm ${!user.isActive ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                          {!user.isActive ? 'Blocked' : 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 text-slate-300 group-hover:text-emerald-500 transition-colors">
                          <FaEye />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                <p className="text-xs font-bold text-slate-400">
                  Page {page} of {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-emerald-600 disabled:opacity-50 transition-all shadow-xs"
                  >
                    <FaChevronLeft size={12} />
                  </button>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(p => p + 1)}
                    className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-emerald-600 disabled:opacity-50 transition-all shadow-xs"
                  >
                    <FaChevronRight size={12} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* User Sidebar / Details */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            {selectedUser ? (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6 animate-in slide-in-from-right-4 duration-300">
                <div className="text-center relative">
                  <div className="w-24 h-24 rounded-3xl bg-linear-to-br from-emerald-400 to-teal-500 mx-auto flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-emerald-500/20 border-4 border-white mb-4">
                    {(selectedUser.name || "U").charAt(0).toUpperCase()}
                  </div>
                  <h3 className="text-xl font-black text-slate-900">{selectedUser.name || "Customer"}</h3>
                  <p className="text-slate-400 text-sm font-medium">{selectedUser.email}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Orders</p>
                    <p className="text-xl font-black text-slate-900">{detailsLoading ? '...' : (selectedUser.orders || []).length}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Items in Cart</p>
                    <p className="text-xl font-black text-slate-900">{detailsLoading ? '...' : (selectedUser.cartItemCount || 0)}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Account Actions</h4>
                  {(() => {
                    const { user: currentUser } = useAuth();
                    const isSelf = selectedUser.id === currentUser?.id;
                    const isAdmin = selectedUser.role === 2 || String(selectedUser.role).toLowerCase() === 'admin';
                    const canBlock = !isSelf && !isAdmin;

                    return (
                      <button
                        onClick={() => handleToggleBlock(selectedUser)}
                        disabled={updatingId === selectedUser.id || (selectedUser.isActive && !canBlock)}
                        className={`w-full py-4 px-6 rounded-2xl font-black text-sm transition-all flex flex-col items-center justify-center gap-1 shadow-lg
                          ${!selectedUser.isActive
                            ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/20'
                            : canBlock
                              ? 'bg-rose-500 text-white hover:bg-rose-600 shadow-rose-500/20'
                              : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none border-2 border-slate-100'
                          }
                        `}
                      >
                        <div className="flex items-center gap-3">
                          {!selectedUser.isActive ? <FaUserCheck /> : <FaUserAltSlash />}
                          <span>
                            {updatingId === selectedUser.id ? 'Processing...' : (!selectedUser.isActive ? 'Unblock User' : 'Block User')}
                          </span>
                        </div>
                        {selectedUser.isActive && !canBlock && (
                          <span className="text-[9px] uppercase tracking-tighter opacity-80">
                            {isSelf ? "(You cannot block yourself)" : "(Admins cannot be blocked)"}
                          </span>
                        )}
                      </button>
                    );
                  })()}
                </div>

                <div className="pt-6 border-t border-slate-50">
                  <div className="flex items-start gap-3 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                    <FaShieldAlt className="text-slate-400 mt-1" />
                    <div>
                      <p className="text-xs font-bold text-slate-600">ID Verification</p>
                      <p className="text-[10px] text-slate-400 font-medium">#{selectedUser.id}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 p-12 text-center">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-300 mx-auto mb-4 shadow-sm">
                  <FaUserShield size={24} />
                </div>
                <h3 className="text-slate-900 font-black mb-1">Select User</h3>
                <p className="text-slate-500 text-sm font-medium">Click on a user from the list to view their details and moderate account permissions.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}