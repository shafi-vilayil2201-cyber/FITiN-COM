import React, { useState, useEffect } from "react";
import {
  getAllCategories,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
  IMAGE_BASE_URL
} from "../../services/api";
import { toast } from "react-toastify";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaImage,
  FaLayerGroup,
  FaSearch,
  FaTimes,
  FaCheck,
  FaCloudUploadAlt
} from "react-icons/fa";

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await getAllCategories();
      setCategories(data || []);
    } catch (error) {
      toast.error("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const resetForm = () => {
    setFormData({ name: "", image: null });
    setImagePreview(null);
    setEditingCategory(null);
    setShowModal(false);
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, image: null });
    setImagePreview(category.imageUrl);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.warning("Category name is required");
      return;
    }

    const data = new FormData();
    data.append("Name", formData.name);
    if (formData.image) {
      data.append("Image", formData.image);
    }

    try {
      if (editingCategory) {
        await adminUpdateCategory(editingCategory.id, data);
        toast.success("Category updated successfully");
      } else {
        await adminCreateCategory(data);
        toast.success("Category created successfully");
      }
      fetchCategories();
      resetForm();
    } catch (error) {
      toast.error(error.message || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await adminDeleteCategory(id);
        toast.success("Category deleted successfully");
        fetchCategories();
      } catch (error) {
        toast.error("Failed to delete category");
      }
    }
  };

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100">
            <FaLayerGroup size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Category Management</h1>
            <p className="text-slate-400 text-sm font-medium">Organize and manage your store categories</p>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95"
        >
          <FaPlus size={14} />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="relative group max-w-md">
        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
          <FaSearch size={14} />
        </div>
        <input
          type="text"
          placeholder="Search categories..."
          className="w-full bg-white border border-slate-100 pl-12 pr-5 py-4 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold text-slate-700 shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-[2rem] p-6 h-48 animate-pulse border border-slate-100" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCategories.map((category) => (
            <div
              key={category.id}
              className="group bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 overflow-hidden flex flex-col"
            >
              <div className="relative h-40 bg-slate-50 overflow-hidden">
                {category.imageUrl ? (
                  <img
                    src={category.imageUrl.startsWith('http') ? category.imageUrl : `${IMAGE_BASE_URL}${category.imageUrl}`}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-200">
                    <FaImage size={40} />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-black text-slate-800 tracking-tight">{category.name}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(category)}
                      className="p-2.5 bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl transition-all"
                    >
                      <FaEdit size={12} />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="p-2.5 bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all"
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>
                </div>
                <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Added</span>
                  <span className="text-[10px] font-bold text-slate-500">
                    {category.createdAt ? new Date(category.createdAt).toLocaleDateString() : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {filteredCategories.length === 0 && (
            <div className="col-span-full py-20 text-center bg-white rounded-[2rem] border border-dashed border-slate-200">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                <FaLayerGroup size={32} />
              </div>
              <p className="text-slate-400 font-bold tracking-tight">No categories found matching your search</p>
            </div>
          )}
        </div>
      )}

      {/* Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={resetForm} />

          <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  {editingCategory ? "Edit Category" : "Add New Category"}
                </h3>
                <p className="text-slate-400 text-xs font-medium uppercase tracking-widest mt-1">Category Details</p>
              </div>
              <button
                onClick={resetForm}
                className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 transition-all flex items-center justify-center"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Category Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Running"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold text-slate-800"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Category Image</label>
                <div className="relative group">
                  <input
                    type="file"
                    id="image"
                    className="hidden"
                    onChange={handleImageChange}
                    accept="image/*"
                  />
                  <label
                    htmlFor="image"
                    className="flex flex-col items-center justify-center w-full h-48 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] cursor-pointer hover:bg-emerald-50 hover:border-emerald-200 transition-all overflow-hidden"
                  >
                    {imagePreview ? (
                      <div className="relative w-full h-full group">
                        <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <FaCloudUploadAlt className="text-white text-3xl" />
                        </div>
                      </div>
                    ) : (
                      <div className="text-center p-6">
                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mx-auto mb-3 text-slate-400 group-hover:text-emerald-500 transition-colors">
                          <FaCloudUploadAlt size={24} />
                        </div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Click to upload image</p>
                        <p className="text-[10px] text-slate-300 mt-1">SVG, PNG, JPG (max. 2MB)</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 py-4 px-6 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 px-6 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 group"
                >
                  <FaCheck />
                  <span>{editingCategory ? "Save Changes" : "Create Category"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
