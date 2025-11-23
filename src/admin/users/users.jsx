import React, { useEffect, useState } from "react";

const PAGE_SIZE = 10;

/* Environment-based backend URL */
import { API_BASE } from '../../services/api';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/users`);
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Unable to load users. Check server or network.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  const filtered = users.filter((u) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      (u.name && u.name.toLowerCase().includes(s)) ||
      (u.email && u.email.toLowerCase().includes(s)) ||
      (u.id && String(u.id).toLowerCase().includes(s))
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const selectUser = (u) => {
    setSelected(u);
  };

  const toggleBlock = async (user) => {
    if (!user || !user.id) return;

    const newBlock = !user?.isBlock;
    if (!window.confirm(`${newBlock ? "Block" : "Unblock"} user ${user.name || user.email}?`)) return;

    setUpdatingId(user.id);
    try {
      const res = await fetch(`${API_BASE}/users/${encodeURIComponent(user.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBlock: newBlock }),
      });
      if (!res.ok) throw new Error("Failed to update user");
      const updatedUser = await res.json();

      setUsers((prev) =>
        prev.map((p) =>
          String(p.id) === String(updatedUser.id || user.id)
            ? { ...p, ...(updatedUser || { isBlock: newBlock }) }
            : p
        )
      );

      if (selected && String(selected.id) === String(updatedUser.id || user.id)) {
        setSelected((prevSelected) => ({
          ...prevSelected,
          ...(updatedUser || { isBlock: newBlock }),
        }));
      }
    } catch (err) {
      console.error(err);
      alert("Could not update user — check console");
    } finally {
      setUpdatingId(null);
    }
  };

  const refresh = () => {
    setPage(1);
    loadUsers();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-8 space-y-4">
        <header className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-800">Users</h2>
            <p className="text-sm text-slate-500">Manage and moderate users</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={refresh}
              className="px-3 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 shadow"
              type="button"
            >
              Refresh
            </button>
          </div>
        </header>

        <div className="bg-white rounded-2xl p-4 border border-emerald-100/20 bg-linear-to-b from-emerald-100 to-white group transition-all duration-200 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name, email or id..."
              className="flex-1 px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-emerald-200"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm shadow-xl border-emerald-100/20 bg-linear-to-b from-emerald-100 to-white group">
              <thead className="bg-slate-50 ">
                <tr>
                  <th className="px-4 py-3 text-left text-slate-600">#</th>
                  <th className="px-4 py-3 text-left text-slate-600">Name</th>
                  <th className="px-4 py-3 text-left text-slate-600">Role</th>
                  <th className="px-4 py-3 text-left text-slate-600">Status</th>
                  <th className="px-4 py-3 text-right text-slate-600">Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-slate-500">
                      Loading users...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-red-600">
                      {error}
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-slate-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  pageItems.map((u, idx) => (
                    <tr
                      key={u.id}
                      className="odd:bg-white even:bg-slate-50 hover:bg-white/80 hover:shadow-md transition-all duration-150"
                      onClick={() => {
                        selectUser(u);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    >
                      <td className="px-4 py-3">{(page - 1) * PAGE_SIZE + idx + 1}</td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            selectUser(u);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className="text-slate-800 font-medium hover:underline"
                        >
                          {u.name || "—"}
                        </button>
                      </td>
                      <td className="px-4 py-3">{u.role || "user"}</td>
                      <td className="px-4 py-3">
                        {u.isBlock ? (
                          <span className="text-xs px-2 py-1 rounded-full bg-red-50 text-red-700">Blocked</span>
                        ) : (
                          <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700">Active</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleBlock(u);
                            }}
                            disabled={updatingId === u.id}
                            className="px-2 py-1 text-sm rounded-md border hover:bg-slate-50"
                          >
                            {updatingId === u.id ? "Updating..." : u.isBlock ? "Unblock" : "Block"}
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              selectUser(u);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            className="px-2 py-1 text-sm rounded-md border hover:bg-slate-50"
                          >
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {filtered.length > PAGE_SIZE && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-slate-500">
                Showing {(page - 1) * PAGE_SIZE + 1} - {Math.min(page * PAGE_SIZE, filtered.length)} of{" "}
                {filtered.length}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 rounded-md border hover:bg-slate-50 disabled:opacity-50"
                  type="button"
                >
                  Prev
                </button>
                <div className="text-sm px-3">
                  {page} / {totalPages}
                </div>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 rounded-md border hover:bg-slate-50 disabled:opacity-50"
                  type="button"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <aside className="lg:col-span-4">
        <div className="sticky top-6 space-y-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-emerald-100/20 bg-linear-to-b from-emerald-200 to-emerald-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-500">Selected User</div>
                <div className="font-medium text-slate-800">{selected?.name || "No user selected"}</div>
                <div className="text-xs text-slate-400">{selected?.email || ""}</div>
              </div>
              <div className="w-12 h-12 rounded-full bg-linear-to-r from-emerald-400 to-emerald-600 text-white flex items-center justify-center font-semibold">
                {selected?.name ? selected.name.charAt(0).toUpperCase() : "U"}
              </div>
            </div>

            {selected ? (
              <>
                <div className="mt-4 text-sm text-slate-500">
                  <div>
                    Role: <span className="font-medium text-slate-700">{selected.role || "user"}</span>
                  </div>
                  <div className="mt-2">
                    Blocked: <span className="font-medium">{selected.isBlock ? "Yes" : "No"}</span>
                  </div>
                  <div className="mt-2 text-xs">
                    ID: <span className="text-slate-600">{selected.id}</span>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => toggleBlock(selected)}
                    disabled={updatingId === selected.id}
                    className="flex-1 px-3 py-2 rounded-full bg-red-500 text-white hover:bg-red-700 disabled:opacity-60"
                    type="button"
                  >
                    {selected.isBlock ? "Unblock user" : "Block user"}
                  </button>
                </div>

                <div className="mt-4 text-sm">
                  <div className="font-medium text-slate-800 mb-2">Summary</div>
                  <div className="text-slate-500">
                    Orders:{" "}
                    <span className="font-semibold text-slate-700">
                      {(selected.orders || []).length}
                    </span>
                  </div>
                  <div className="mt-2 text-slate-500">
                    Cart items:{" "}
                    <span className="font-semibold text-slate-700">
                      {(selected.cart || []).length}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="mt-4 text-sm text-slate-500">
                  Select a user from the list to view details, block/unblock or delete.
                </div>

                <button
                  onClick={() => loadUsers()}
                  className="mt-4 w-full py-2 rounded-full bg-linear-to-r from-emerald-400 to-emerald-600 text-white text-sm font-medium shadow"
                  type="button"
                >
                  Refresh users
                </button>
              </>
            )}
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border text-sm text-slate-500 border-emerald-100/20 bg-linear-to-b from-emerald-200 to-emerald-100">
            <div className="font-medium text-slate-800">Quick Stats</div>
            <div className="mt-2">
              Total users:{" "}
              <span className="font-semibold text-slate-700">{users.length}</span>
            </div>
            <div className="mt-1">
              Blocked:{" "}
              <span className="font-semibold">{users.filter((u) => u.isBlock).length}</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}