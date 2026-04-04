import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaImage,
  FaTimes,
  FaCheck,
  FaBoxOpen,
  FaTag
} from "react-icons/fa";

/* Environment-aware API helpers */
import {
  adminGetProducts,
  getAllCategories,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct
} from '../../services/api';

export default function ProductsAdmin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const emptyForm = {
    name: "",
    brand: "",
    sport: "",
    categoryId: "",
    price: "",
    discount: "0",
    stock: "0",
    rating: "5",
    imageUrl: "",
    description: "",
    shortDescription: "",
    longDescription: "",
  };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await adminGetProducts();
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(error.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await getAllCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Category fetch error:", err);
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setDeletingId(toDelete.id);
    try {
      await adminDeleteProduct(toDelete.id);
      setItems((prev) => prev.filter((p) => p.id !== toDelete.id));
      toast.success("Product removed successfully");
      setConfirmOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete product");
    } finally {
      setDeletingId(null);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.categoryId || !form.price || !form.sport) {
      toast.error("Please fill in all required fields including Sport");
      return;
    }

    setFormLoading(true);
    try {
      const formData = new FormData();
      Object.keys(form).forEach(key => {
        const backendKey = key.charAt(0).toUpperCase() + key.slice(1);
        formData.append(backendKey, form[key]);
      });

      let saved;
      if (editingProduct) {
        saved = await adminUpdateProduct(editingProduct.id, formData);
        setItems(prev => prev.map(p => p.id === saved.id ? saved : p));
        toast.success("Product updated");
      } else {
        saved = await adminCreateProduct(formData);
        setItems(prev => [saved, ...prev]);
        toast.success("Product created");
      }
      setPanelOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to save product");
    } finally {
      setFormLoading(false);
    }
  };

  const filtered = items.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.brand?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Products</h1>
          <p className="text-slate-500 font-medium">Manage your inventory and catalog</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none w-64"
            />
          </div>
          <button
            onClick={() => { setEditingProduct(null); setForm(emptyForm); setPanelOpen(true); }}
            className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 hover:-translate-y-0.5 active:translate-y-0 transition-all"
          >
            <FaPlus className="text-sm" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Product List */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Product</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Price</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Stock</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-center">Category</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                [1, 2, 3].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-6"><div className="h-10 bg-slate-100 rounded-lg w-48"></div></td>
                    <td className="px-6 py-6"><div className="h-6 bg-slate-100 rounded-lg w-16 mx-auto"></div></td>
                    <td className="px-6 py-6"><div className="h-6 bg-slate-100 rounded-lg w-12 mx-auto"></div></td>
                    <td className="px-6 py-6"><div className="h-6 bg-slate-100 rounded-lg w-24 mx-auto"></div></td>
                    <td className="px-6 py-6"><div className="h-8 bg-slate-100 rounded-lg w-20 ml-auto"></div></td>
                  </tr>
                ))
              ) : filtered.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-100 group-hover:scale-105 transition-transform">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300"><FaImage /></div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 truncate">{product.name}</p>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter">{product.brand || "FitN Brand"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-black text-slate-900">₹{product.price.toLocaleString()}</span>
                    {product.discount > 0 && <p className="text-[10px] text-emerald-600 font-bold">-{product.discount}% OFF</p>}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-lg text-xs font-black shadow-inner
                      ${product.stock > 10 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}
                    `}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">
                      <FaTag className="text-[10px]" />
                      {categories.find(c => c.id === product.categoryId)?.name || "General"}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingProduct(product);
                          setForm({
                            ...product,
                            categoryId: product.categoryId,
                            description: product.description || product.shortDescription || ""
                          });
                          setPanelOpen(true);
                        }}
                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => { setToDelete(product); setConfirmOpen(true); }}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit/Add Panel */}
      {panelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end p-4 md:p-6 animate-in slide-in-from-right duration-300">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setPanelOpen(false)} />
          <div className="relative w-full max-w-xl bg-white h-full rounded-3xl shadow-2xl flex flex-col items-stretch overflow-hidden border border-slate-100">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black text-slate-900">{editingProduct ? "Update Item" : "New Product"}</h3>
                <p className="text-slate-400 text-sm font-medium">Capture all details to update the catalog.</p>
              </div>
              <button onClick={() => setPanelOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-50 text-slate-400 transition-colors">
                <FaTimes />
              </button>
            </div>

            <form onSubmit={onSubmit} className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Product Name*</label>
                    <input
                      type="text" required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none text-sm font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Brand</label>
                    <input
                      type="text"
                      value={form.brand}
                      onChange={(e) => setForm({ ...form, brand: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none text-sm font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Sport*</label>
                    <input
                      type="text" required
                      placeholder="e.g. Football, Basketball"
                      value={form.sport}
                      onChange={(e) => setForm({ ...form, sport: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none text-sm font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Category*</label>
                  <select
                    required
                    value={form.categoryId}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none text-sm font-bold appearance-none cursor-pointer"
                  >
                    <option value="">Choose category...</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Price</label>
                    <input
                      type="number" required
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none text-sm font-black"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Stock</label>
                    <input
                      type="number"
                      value={form.stock}
                      onChange={(e) => setForm({ ...form, stock: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none text-sm font-black"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Disc%</label>
                    <input
                      type="number"
                      value={form.discount}
                      onChange={(e) => setForm({ ...form, discount: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none text-sm font-black"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Image URL</label>
                  <input
                    type="text"
                    value={form.imageUrl}
                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none text-xs font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Short Description</label>
                  <input
                    type="text"
                    value={form.shortDescription}
                    onChange={(e) => setForm({ ...form, shortDescription: e.target.value, description: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none text-sm font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Full Description</label>
                  <textarea
                    rows={4}
                    value={form.longDescription}
                    onChange={(e) => setForm({ ...form, longDescription: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none text-sm font-medium"
                  />
                </div>
              </div>

              <div className="pt-6 flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setPanelOpen(false)}
                  className="flex-1 py-4 bg-slate-50 text-slate-500 font-black rounded-2xl border border-slate-100 hover:bg-slate-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 py-4 bg-emerald-600 text-white font-black rounded-2xl shadow-xl shadow-emerald-100 hover:bg-emerald-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {formLoading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                  <span>{editingProduct ? "Update Product" : "Launch Product"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {confirmOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setConfirmOpen(false)} />
          <div className="relative max-w-sm w-full bg-white rounded-3xl shadow-2xl p-8 border border-slate-100">
            <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 text-2xl mb-6 shadow-inner mx-auto">
              <FaTrash />
            </div>
            <h3 className="text-xl font-black text-slate-900 text-center">Are you absolute sure?</h3>
            <p className="mt-2 text-slate-500 text-sm font-medium text-center">
              This will permanently remove <span className="text-slate-900 font-bold">{toDelete?.name}</span> from the catalog.
            </p>
            <div className="mt-8 flex flex-col gap-2">
              <button
                onClick={handleDelete}
                disabled={deletingId}
                className="w-full py-4 bg-rose-600 text-white font-black rounded-2xl shadow-lg shadow-rose-200 hover:bg-rose-700 active:scale-95 transition-all text-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deletingId && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                Confirm Deletion
              </button>
              <button
                onClick={() => setConfirmOpen(false)}
                className="w-full py-4 bg-slate-50 text-slate-500 font-black rounded-2xl hover:bg-white border border-transparent hover:border-slate-100 transition-all text-sm"
              >
                Wait, take me back
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}