import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Edit, Trash2, Folder, AlertTriangle, Eye, EyeOff, Save, X, ArrowUp, ArrowDown, Upload, CheckCircle, Package } from 'lucide-react';
import { toast } from 'sonner';
import AdminLayout from '../../components/admin/AdminLayout';
import Card from '../../components/admin/Card';
import Button from '../../components/admin/Button';
import Select from '../../components/admin/Select';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { API_BASE_URL } from '../../config';

const CategoriesList: React.FC = () => {
  const { accessToken } = useAuth();
  const { categories, categoriesLoading, refreshCategories } = useStore();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'sortOrder' | 'name' | 'newest'>('sortOrder');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Form Drawer States
  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null); // null means adding
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    image: '',
    altText: '',
    isActive: true,
    sortOrder: 0,
  });

  // Delete Modal States
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const handleNameChange = (nameVal: string) => {
    const slugVal = nameVal
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    setFormData((prev) => ({
      ...prev,
      name: nameVal,
      slug: slugVal,
    }));
  };

  const handleAddTrigger = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      image: '',
      altText: '',
      isActive: true,
      sortOrder: 0,
    });
    setFormOpen(true);
  };

  const handleEditTrigger = (category: any) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      image: category.image,
      altText: category.altText || '',
      isActive: category.isActive,
      sortOrder: category.sortOrder || 0,
    });
    setFormOpen(true);
  };

  const handleDeleteTrigger = (id: string) => {
    setItemToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPG, JPEG, PNG, and WEBP images are supported.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Cover image must be less than 5MB.');
      return;
    }

    setUploading(true);
    const uploadFormData = new FormData();
    uploadFormData.append('image', file);

    try {
      const response = await fetch(`${API_BASE_URL}/admin/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: uploadFormData,
      });

      if (response.ok) {
        const data = await response.json();
        setFormData((prev) => ({ ...prev, image: data.url }));
        toast.success('Category cover image uploaded successfully!');
      } else {
        const err = await response.json();
        toast.error(err.message || 'Image upload failed.');
      }
    } catch (error) {
      console.error('Image Upload Error:', error);
      toast.error('Image upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleToggleActive = async (category: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/categories/${category.id || category._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ isActive: !category.isActive }),
      });

      if (response.ok) {
        toast.success(`Category ${!category.isActive ? 'enabled' : 'disabled'} successfully.`);
        await refreshCategories();
      } else {
        toast.error('Failed to toggle status.');
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('Failed to toggle status.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.image) {
      toast.error('Name and Cover Image are required.');
      return;
    }

    try {
      const method = editingCategory ? 'PUT' : 'POST';
      const url = editingCategory
        ? `${API_BASE_URL}/admin/categories/${editingCategory.id || editingCategory._id}`
        : `${API_BASE_URL}/admin/categories`;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(editingCategory ? 'Category updated successfully' : 'Category created successfully');
        setFormOpen(false);
        await refreshCategories();
      } else {
        const err = await response.json();
        toast.error(err.message || 'Failed to save category');
      }
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Failed to save category');
    }
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      const response = await fetch(`${API_BASE_URL}/admin/categories/${itemToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        toast.success('Category deleted successfully.');
        await refreshCategories();
      } else {
        const err = await response.json();
        toast.error(err.message || 'Failed to delete category.');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category.');
    } finally {
      setDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  // Filter & Sort dynamic logic
  const filteredCategories = categories.filter((cat) => {
    const query = searchQuery.toLowerCase();
    return (
      cat.name.toLowerCase().includes(query) ||
      cat.slug.toLowerCase().includes(query)
    );
  });

  const sortedCategories = [...filteredCategories].sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'sortOrder') {
      comparison = (a.sortOrder || 0) - (b.sortOrder || 0);
    } else if (sortBy === 'name') {
      comparison = a.name.localeCompare(b.name);
    } else if (sortBy === 'newest') {
      comparison = new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  return (
    <AdminLayout title="Categories">
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>

      <div className="space-y-6">
        {/* Header Section with Stats Cards */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          {/* Stats Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1 max-w-3xl">
            <div className="bg-white border border-slate-100/80 rounded-2xl p-3.5 shadow-3xs flex items-center gap-3 transition-all hover:shadow-2xs">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100/50 flex items-center justify-center text-indigo-650 shrink-0">
                <Folder size={16} />
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider leading-none">Total Collections</span>
                <span className="text-base font-bold text-slate-800 font-display mt-0.5 block leading-none">{categories.length}</span>
              </div>
            </div>

            <div className="bg-white border border-slate-100/80 rounded-2xl p-3.5 shadow-3xs flex items-center gap-3 transition-all hover:shadow-2xs">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100/50 flex items-center justify-center text-emerald-600 shrink-0">
                <CheckCircle size={16} />
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider leading-none">Active</span>
                <span className="text-base font-bold text-slate-800 font-display mt-0.5 block leading-none">
                  {categories.filter(c => c.isActive).length}
                </span>
              </div>
            </div>

            <div className="bg-white border border-slate-100/80 rounded-2xl p-3.5 shadow-3xs flex items-center gap-3 transition-all hover:shadow-2xs">
              <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-100/50 flex items-center justify-center text-sky-650 shrink-0">
                <Package size={16} />
              </div>
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider leading-none">Total Products</span>
                <span className="text-base font-bold text-slate-800 font-display mt-0.5 block leading-none">
                  {categories.reduce((acc, cat) => acc + (cat.count || 0), 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Add Category Button on the right */}
          <Button icon={Plus} onClick={handleAddTrigger} className="self-start lg:self-auto py-2.5 px-5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/10 h-11 shrink-0">
            Add Category
          </Button>
        </div>

        {/* Toolbar Card */}
        <Card className="p-3 bg-white">
          <div className="flex flex-wrap items-center gap-4 justify-start">
            {/* Search Input Box */}
            <div className="relative w-full sm:max-w-xs md:max-w-sm">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search categories..."
                className="w-full pl-12 pr-4 py-2 border border-gray-250/70 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-sans text-xs"
              />
            </div>

            {/* Sorting controls in a single row */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-455 uppercase tracking-wider whitespace-nowrap">Sort By:</span>
              <Select
                value={sortBy}
                onChange={(val) => setSortBy(val as any)}
                hClass="h-9"
                className="w-36"
                options={[
                  { value: 'sortOrder', label: 'Sort Order' },
                  { value: 'name', label: 'Name' },
                  { value: 'newest', label: 'Date Created' }
                ]}
              />

              <button
                type="button"
                onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="p-2 hover:bg-slate-50 border border-slate-200 rounded-xl transition text-slate-600 cursor-pointer flex items-center justify-center h-9 w-9"
                title={`Sort Direction: ${sortDirection}`}
              >
                {sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
              </button>
            </div>
          </div>
        </Card>

        {/* Category List Loader / Grid */}
        {categoriesLoading ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <div className="w-10 h-10 border-4 border-indigo-150 border-t-indigo-650 rounded-full animate-spin" />
          </div>
        ) : sortedCategories.length === 0 ? (
          <Card className="p-12 text-center text-gray-500 font-sans">
            <Folder className="mx-auto text-slate-355 mb-3" size={40} />
            <p className="text-sm font-semibold">No categories found matching your query.</p>
            <p className="text-xs text-slate-400 mt-1">Try refining your search terms or create a new category.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {sortedCategories.map((category) => {
              return (
                <div
                  key={category.id || category._id}
                  className={`relative group bg-white border border-slate-105 rounded-3xl overflow-hidden shadow-3xs hover:shadow-md transition-all duration-305 flex flex-col justify-between border-t-4 border-t-indigo-600 ${
                    !category.isActive ? 'opacity-80' : ''
                  }`}
                >
                  {/* Image & Visibility overlay (Clicking navigates to detail page) */}
                  <div
                    onClick={() => navigate(`/admin/categories/${category.id || category._id}`)}
                    className="relative aspect-[16/9] w-full bg-slate-100 overflow-hidden cursor-pointer"
                  >
                    <img
                      src={category.image}
                      alt={category.altText || category.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
                    />
                    
                    {/* Visual Accents & Status Badges */}
                    {!category.isActive && (
                      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center">
                        <span className="px-3 py-1 bg-red-650 text-white font-bold text-[9px] rounded-full uppercase tracking-widest shadow-sm flex items-center gap-1.5 animate-pulse">
                          <EyeOff size={11} /> Disabled
                        </span>
                      </div>
                    )}
                    
                    {category.isActive && (
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-0.5 bg-emerald-600 text-white font-bold text-[9px] rounded-full uppercase tracking-widest shadow-sm">
                          Active
                        </span>
                      </div>
                    )}
                    
                    {category.sortOrder !== undefined && (
                      <div className="absolute top-3 right-3 bg-slate-950/75 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded-lg shadow-sm">
                        Order: {category.sortOrder}
                      </div>
                    )}
                  </div>

                  {/* Body Details */}
                  <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                    <div 
                      onClick={() => navigate(`/admin/categories/${category.id || category._id}`)}
                      className="space-y-1.5 cursor-pointer"
                    >
                      <h3 className="font-display font-bold text-lg text-slate-900 line-clamp-1 group-hover:text-indigo-650 transition-colors">
                        {category.name}
                      </h3>
                      <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400 uppercase tracking-wide">
                        <span>Path:</span>
                        <span className="font-semibold text-slate-550">/collections/{category.slug}</span>
                      </div>
                      {category.altText && (
                        <p className="text-[10px] text-slate-450 italic mt-1.5 pl-2 border-l-2 border-slate-200 line-clamp-1">
                          Alt: "{category.altText}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-50 pt-3.5 mt-auto">
                      {/* Products Counter badge */}
                      <span className="text-[10px] font-bold font-sans text-indigo-700 bg-indigo-50 border border-indigo-150/50 px-3 py-1 rounded-full flex items-center gap-1 shadow-3xs">
                        <Package size={11} className="text-indigo-500" />
                        {category.count || 0} {category.count === 1 ? 'Product' : 'Products'}
                      </span>

                      {/* Quick actions row */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(category)}
                          className={`p-2 rounded-xl border transition-all cursor-pointer ${
                            category.isActive
                              ? 'border-slate-250 text-slate-500 hover:text-red-500 hover:border-red-100 hover:bg-red-50/20'
                              : 'border-emerald-200 text-emerald-600 bg-emerald-50/10 hover:bg-emerald-50/30 hover:border-emerald-300'
                          }`}
                          title={category.isActive ? 'Disable Category' : 'Enable Category'}
                        >
                          {category.isActive ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEditTrigger(category)}
                          className="p-2 border border-slate-200 text-slate-500 hover:text-indigo-650 hover:border-indigo-100 hover:bg-indigo-50/20 rounded-xl transition cursor-pointer"
                          title="Edit Details"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteTrigger(category.id || category._id || '')}
                          className="p-2 border border-slate-200 text-slate-500 hover:text-red-600 hover:border-red-100 hover:bg-red-50/20 rounded-xl transition cursor-pointer"
                          title="Delete Category"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal Form Drawer (Slides in from the right) */}
        {formOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex justify-end">
            {/* Click backdrop to close */}
            <div className="absolute inset-0 -z-10 cursor-default" onClick={() => setFormOpen(false)} />
            
            <div 
              className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col border-l border-slate-200/80 overflow-y-auto"
              style={{ animation: 'slideInRight 0.25s ease-out' }}
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/40">
                <h3 className="text-lg font-bold text-gray-900">
                  {editingCategory ? 'Edit Category' : 'Add Category'}
                </h3>
                <button
                  onClick={() => setFormOpen(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-xl transition text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 flex-1 flex flex-col justify-between space-y-6">
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-650 uppercase tracking-wider mb-2">Category Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="e.g. Lip Balms"
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-sans text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-650 uppercase tracking-wider mb-2">Image Alt Text (SEO)</label>
                    <input
                      type="text"
                      value={formData.altText}
                      onChange={(e) => setFormData({ ...formData, altText: e.target.value })}
                      placeholder="Provide a description of the cover image..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-sans text-sm"
                    />
                  </div>

                  {/* Dropzone Cover Image Upload */}
                  <div>
                    <label className="block text-xs font-bold text-slate-650 uppercase tracking-wider mb-2">Cover Image Selection</label>
                    <div className="border-2 border-dashed border-gray-200 rounded-2xl p-4 text-center hover:border-indigo-500/50 transition-colors relative bg-gray-50/10 overflow-hidden min-h-[160px] flex flex-col items-center justify-center">
                      {formData.image ? (
                        <div className="relative w-full h-full group flex items-center justify-center">
                          <img
                            src={formData.image}
                            alt="Category Cover"
                            className="max-h-40 max-w-full object-contain rounded-xl bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                            className="absolute top-2 right-2 p-1.5 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-md transition-colors cursor-pointer focus:outline-none z-20"
                            title="Clear Image"
                          >
                            <X size={12} />
                          </button>
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                            <label className="text-white text-xs font-semibold cursor-pointer px-4 py-2 bg-black/60 rounded-full">
                              Change Image
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  if (e.target.files?.[0]) {
                                    handleImageUpload(e.target.files[0]);
                                  }
                                }}
                              />
                            </label>
                          </div>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center cursor-pointer w-full py-6">
                          <span className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-650 flex items-center justify-center mb-2">
                            <Upload size={20} />
                          </span>
                          <span className="text-xs font-semibold text-gray-700">Click to upload cover image</span>
                          <span className="text-[10px] text-gray-400 mt-1">PNG, JPG, WEBP up to 5MB</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files?.[0]) {
                                handleImageUpload(e.target.files[0]);
                              }
                            }}
                          />
                        </label>
                      )}
                      {uploading && (
                        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                          <div className="w-6 h-6 border-2 border-indigo-100 border-t-indigo-650 rounded-full animate-spin" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-650 uppercase tracking-wider mb-2">Sort Display Order</label>
                    <input
                      type="number"
                      value={formData.sortOrder}
                      onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value, 10) || 0 })}
                      placeholder="e.g. 5"
                      min={0}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-sans text-sm"
                    />
                  </div>

                  <div className="flex items-center pt-2">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="w-5 h-5 text-primary rounded border-slate-350 focus:ring-primary cursor-pointer"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-700 block">Status: Active</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">Let users see and shop from this collection.</span>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-6 border-t border-slate-100 mt-auto">
                  <button
                    type="button"
                    onClick={() => setFormOpen(false)}
                    className="flex-1 py-3 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold text-xs rounded-2xl border border-gray-200 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <Button
                    type="submit"
                    icon={Save}
                    className="flex-1 justify-center py-3 text-xs font-bold shadow-lg shadow-indigo-500/10"
                  >
                    {editingCategory ? 'Save Changes' : 'Create Category'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal (Perfect Layout with Standard Tailwind Red Button) */}
        {deleteModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4 border border-gray-150 animate-scale-in">
              <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <AlertTriangle size={24} />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-gray-900">Delete Category</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Are you sure you want to delete this category? Products linked to it won't be deleted, but they will lose their category tag.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setDeleteModalOpen(false);
                    setItemToDelete(null);
                  }}
                  className="flex-1 py-2.5 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold text-xs rounded-xl border border-gray-200 transition cursor-pointer focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="flex-1 py-2.5 px-4 bg-red-650 bg-red-600 hover:bg-red-750 hover:bg-red-750 hover:bg-red-700 text-white font-semibold text-xs rounded-xl transition cursor-pointer focus:outline-none"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default CategoriesList;
