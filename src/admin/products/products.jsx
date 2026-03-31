import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

/* Environment-aware API base */
import { API_BASE } from '../../services/api';

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

  const emptyForm = {
    name: "",
    brand: "",
    sport: "",
    categoryId: "",
    price: "",
    discount: "",
    stock: "",
    rating: "",
    imageUrl: "",
    shortDescription: "",
    longDescription: "",
  };
  const [form, setForm] = useState(emptyForm);

  const [searchTerm, setSearchTerm] = useState("");
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const httpResponse = await fetch(`${API_BASE}/products`);
        if (!httpResponse.ok) throw new Error("Failed to fetch products");

        const result = await httpResponse.json();

        setItems(Array.isArray(result.data) ? result.data : []);
      } catch (error) {
        console.error("Product fetch error:", error);
        toast.error("Failed tp load products");
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  useEffect(() => {
    const loadCategories = async () => {
      const res = await fetch(`${API_BASE}/categories`);
      const result = await res.json();
      setCategories(result.data || []);
    };
    loadCategories();
  }, []);

  const confirmDelete = (product) => {
    setToDelete(product);
    setConfirmOpen(true);
  };

  const closeModal = () => {
    setConfirmOpen(false);
    setToDelete(null);
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    const id = toDelete.id;
    setDeletingId(id);

    try {
      const res = await fetch(`${API_BASE}/products/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error(`Server responded ${res.status}`);
      }

      setItems((prev) => prev.filter((p) => String(p.id) !== String(id)));
      toast.success("Product deleted");
      closeModal();
    } catch (err) {
      console.error("Delete product error:", err);
      toast.error("Failed to delete product");
    } finally {
      setDeletingId(null);
    }
  };

  const openAddPanel = () => {
    setEditingProduct(null);
    setForm(emptyForm);
    setPanelOpen(true);
  };

  const openEditPanel = (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      brand: product.brand,
      sport: product.sport,
      categoryId: product.categoryId,
      price: product.price,
      discount: product.discount,
      stock: product.stock,
      rating: product.rating,
      imageUrl: product.imageUrl,
      shortDescription: product.shortDescription,
      longDescription: product.longDescription,
    });
    setPanelOpen(true);
  };

  const closePanel = () => {
    setPanelOpen(false);
    setEditingProduct(null);
    setForm(emptyForm);
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const fileToDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => {
        reader.abort();
        reject(new Error("Failed to read file"));
      };
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });

  const onFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await fileToDataUrl(file);
      setForm((f) => ({ ...f, imageUrl: dataUrl }));
      toast.info("Image loaded ");
    } catch (err) {
      console.error("File read error", err);
      toast.error("Failed to load image");
    }
  };

  const validateForm = () => {
    if (!form.name?.trim()) return "Name is required";
    if (!form.categoryId?.trim()) return "Category is required";
    if (!form.price || Number.isNaN(Number(form.price))) return "Valid price is required";
    return null;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const errMsg = validateForm();
    if (errMsg) {
      toast.error(errMsg);
      return;
    }
    setFormLoading(true);
    try {
      const formData = new FormData();
      formData.append("Name", form.name);
      formData.append("Brand", form.brand);
      formData.append("Sport", form.sport);
      formData.append("CategoryId", form.categoryId);
      formData.append("Price", form.price || 0);
      formData.append("Stock", form.stock || 0);
      formData.append("ImageUrl", form.imageUrl);
      formData.append("Description", form.shortDescription);
      formData.append("ShortDescription", form.shortDescription);
      formData.append("LongDescription", form.longDescription);
      formData.append("Discount", form.discount || 0);
      formData.append("Rating", form.rating || 0);


      const url = editingProduct
        ? `${API_BASE}/admin/products/${editingProduct.id}` : `${API_BASE}/admin/products`;

      const method = editingProduct ? "PUT" : "POST";

      const res = await fetch(url, {
        method: method,
        body: formData,
      });
      if (!res.ok) throw new Error(`Server responded ${res.status}`);

      const result = await res.json();
      const saved = result.data;

      if (editingProduct) {
        setItems((prev) => prev.map((p) => (String(p.id) === String(saved.id) ? saved : p)));
        toast.success("Product updated");
      } else {
        setItems((prev) => [saved, ...prev]);
        toast.success("Product created");
      }
      closePanel();
    } catch (error) {
      console.error("save product error:", error);
      toast.error("Failed to save product");
    } finally {
      setFormLoading(false);
    }
  };

  const filtered = items.filter((p) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    return (
      String(p.name).toLowerCase().includes(q) ||
      String(p.category ?? "").toLowerCase().includes(q) ||
      String(p.brand ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col">
      <header className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-800">Products</h2>
          <p className="text-sm text-slate-500">Manage your catalog items</p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products..."
            className="px-3 py-2 rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-300"
          />
          <button
            onClick={openAddPanel}
            className="px-4 py-2 rounded-md shadow inline-flex items-center bg-linear-to-r from-emerald-400 to-emerald-500 text-white text-sm font-medium transform transition-all duration-150 hover:from-emerald-500 hover:to-emerald-600 hover:-translate-y-1 hover:shadow-md"
          >
            Add Product
          </button>
        </div>
      </header>

      <div className="flex gap-6">
        <div
          className={`flex-1 transition-all duration-200 ${panelOpen ? "max-w-2xl" : "max-w-full"}`}
        >
          <div className="space-y-4">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="animate-pulse flex gap-4 bg-white rounded-lg p-4 shadow-sm">
                    <div className="w-40 h-28 bg-slate-100 rounded-lg" />
                    <div className="flex-1">
                      <div className="h-5 bg-slate-100 rounded w-1/3 mb-3" />
                      <div className="h-4 bg-slate-100 rounded w-1/2 mb-2" />
                      <div className="h-8 bg-slate-100 rounded w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center text-slate-500 py-8 bg-white rounded-lg border">No products available</div>
            ) : (
              <div className="space-y-4">
                {filtered.map((product) => (
                  <article
                    key={product.id}
                    className="flex flex-col md:flex-row gap-4 items-stretch b rounded-xl p-4 shadow-inner border border-emerald-100/20 bg-linear-to-b from-emerald-200 to-emerald-50 group transform transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="w-full md:w-56 h-44 shrink-0 rounded-lg overflow-hidden bg-slate-100">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          No Image
                        </div>
                      )}
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-4">
                          <h3 className="text-lg font-semibold text-slate-800">{product.name}</h3>
                          <div className="ml-2 inline-flex items-center gap-2">
                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-linear-to-r from-emerald-600 to-green-500 text-white font-semibold text-sm shadow">
                              ₹{product.price ?? "—"}
                            </span>
                          </div>
                        </div>
                        <p className="mt-2 text-sm text-slate-500 line-clamp-2">
                          {product.description ?? product.shortDescription ?? "No description available."}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {product.category && (
                            <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-md">{product.category}</span>
                          )}
                          {product.stock !== undefined && (
                            <span
                              className={`text-xs px-2 py-1 rounded-md ${product.stock > 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                                }`}
                            >
                              {product.stock > 0 ? `In stock (${product.stock})` : "Out of stock"}
                            </span>
                          )}
                          {product.isFeatured && (
                            <span className="text-xs px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md">Featured</span>
                          )}
                        </div>
                      </div>
                      <div className="mt-4 md:mt-0 flex items-center justify-between">
                        <div className="flex items-center gap-3">

                          <button
                            onClick={() => openEditPanel(product)}
                            className="text-sm px-3 py-1 rounded-md hover:bg-slate-50  bg-linear-to-r from-emerald-400 to-emerald-500 text-black font-medium shadow transition-all duration-150 hover:from-emerald-500 hover:to-emerald-600 hover:shadow-md"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => confirmDelete(product)}
                            disabled={deletingId === product.id}
                            className="text-sm px-3 py-1  rounded-md text-black-600 disabled:opacity-60 flex items-center gap-2 hover:bg-slate-50  bg-linear-to-r from-emerald-400 to-emerald-500 font-medium shadow transform transition-all duration-150 hover:from-red-500 hover:to-red-600 hover:-translate-y-1 hover:shadow-md hover:text-white"
                          >
                            {deletingId === product.id ? (
                              <>
                                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                                  <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="opacity-75" />
                                </svg>
                                Deleting...
                              </>
                            ) : (
                              "Delete"
                            )}
                          </button>
                        </div>

                        <div className="text-xs text-slate-400">ID: {product.id}</div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>

        {panelOpen && (
          <aside className="w-[460px] shrink-0 h-fit rounded-xl shadow-lg p-6 border border-emerald-400 bg-linear-to-b from-emerald-200 to-emerald-100 group transform transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">
                  {editingProduct ? "Edit product" : "Add product"}
                </h3>
                <p className="text-sm text-slate-500">
                  {editingProduct ? "Update product details" : "Create a new product"}
                </p>
              </div>
              <button onClick={closePanel} className="text-sm px-2 py-1  rounded-md bg-linear-to-r from-emerald-400 to-emerald-500 text-black font-medium shadow transition-all duration-150 hover:from-emerald-500 hover:to-emerald-600 hover:shadow-md">Close</button>
            </div>

            <form onSubmit={onSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs text-slate-600">Name</label>
                <input name="name" value={form.name} onChange={onChange} className="w-full px-3 py-2 border rounded-md" />

              </div>
              <div>
                <label className="block text-xs text-slate-600">Category</label>
                <select
                  name="categoryId"
                  value={form.categoryId || ""}
                  onChange={onChange}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-600">Brand</label>
                  <input name="brand" value={form.brand} onChange={onChange} className="w-full px-3 py-2 border rounded-md" />
                </div>
                <div>
                  <label className="block text-xs text-slate-600">Sport</label>
                  <input name="sport" value={form.sport} onChange={onChange} className="w-full px-3 py-2 border rounded-md" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <input name="price" value={form.price} onChange={onChange} placeholder="Price" className="px-3 py-2 border rounded-md" />
                <input name="discount" value={form.discount} onChange={onChange} placeholder="Discount (%)" className="px-3 py-2 border rounded-md" />
                <input name="stock" value={form.stock} onChange={onChange} placeholder="Stock" className="px-3 py-2 border rounded-md" />
              </div>

              <div>
                <label className="block text-xs text-slate-600">Short description</label>
                <input name="shortDescription" value={form.shortDescription} onChange={onChange} className="w-full px-3 py-2 border rounded-md" />
              </div>

              <div>
                <label className="block text-xs text-slate-600">Long description</label>
                <textarea name="longDescription" value={form.longDescription} onChange={onChange} rows={4} className="w-full px-3 py-2 border rounded-md" />
              </div>

              <div>
                <label className="block text-xs text-slate-600">Image URL</label>
                <input name="imageUrl" value={form.imageUrl} onChange={onChange} placeholder="https://..." className="w-full px-3 py-2 border rounded-md" />
                <div className="mt-2 text-xs text-slate-500">Or upload a file below; file will be stored as a data URL.</div>
                <input type="file" accept="image/*" onChange={onFileChange} className="mt-2" />
                {form.imageUrl && (
                  <div className="mt-3">
                    <div className="text-xs text-slate-600 mb-1">Preview</div>
                    <div className="w-full h-32 bg-slate-100 rounded overflow-hidden flex items-center justify-center">
                      <img src={form.imageUrl} alt="preview" className="max-h-full object-contain" />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3">
                <button type="button" onClick={closePanel} className="px-4 py-2 rounded-md border hover:bg-slate-50">Cancel</button>

                <button type="submit" disabled={formLoading} className="px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60">
                  {formLoading ? (editingProduct ? "Saving..." : "Creating...") : (editingProduct ? "Save changes" : "Create product")}
                </button>
              </div>



            </form>
          </aside>
        )}
      </div>

      {confirmOpen && toDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={closeModal} />
          <div className="relative z-10 max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-slate-800">Confirm delete</h3>
            <p className="mt-2 text-sm text-slate-600">
              Are you sure you want to delete <span className="font-medium">{toDelete.name}</span>? This action cannot be undone.
            </p>

            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-md border hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                disabled={deletingId !== null}
              >
                {deletingId ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}