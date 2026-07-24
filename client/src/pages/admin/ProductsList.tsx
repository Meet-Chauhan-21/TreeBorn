import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Edit, Trash2, Package, CheckCircle, AlertTriangle, Copy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import AdminLayout from '../../components/admin/AdminLayout';
import Card from '../../components/admin/Card';
import Button from '../../components/admin/Button';
import StatusBadge from '../../components/admin/StatusBadge';
import DataTable from '../../components/admin/DataTable';
import Pagination from '../../components/admin/Pagination';
import StatsCard from '../../components/admin/StatsCard';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config';
import Select from '../../components/admin/Select';

const ProductsList: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(15);

  // Delete Modal States
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Copy Modal States
  const [copyModalOpen, setCopyModalOpen] = useState(false);
  const [itemToCopy, setItemToCopy] = useState<string | null>(null);

  const { accessToken } = useAuth();

  useEffect(() => {
    const fetchProducts = async () => {
      if (!accessToken) return;

      try {
        const response = await fetch(`${API_BASE_URL}/admin/products`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });

        if (response.ok) {
          const data = await response.json();
          setProducts(data.products);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [accessToken]);

  const handleDeleteTrigger = (productId: string) => {
    setItemToDelete(productId);
    setDeleteModalOpen(true);
  };

  const handleCopyTrigger = (productId: string) => {
    setItemToCopy(productId);
    setCopyModalOpen(true);
  };

  const confirmCopyProduct = async (productId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/products/${productId}/copy`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (response.ok) {
        toast.success(data.message || 'Product duplicated successfully');
        // Prepend the new copy to the top of list
        setProducts([data.product, ...products]);
      } else {
        toast.error(data.message || 'Failed to duplicate product');
      }
    } catch (error) {
      console.error('Error duplicating product:', error);
      toast.error('Failed to duplicate product');
    }
  };

  const confirmDeleteProduct = async (productId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/products/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });

      if (response.ok) {
        toast.success('Product deleted successfully');
        setProducts(products.filter(p => p._id !== productId));
      } else {
        toast.error('Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const catName = typeof product.category === 'object' && product.category
      ? product.category.name
      : (product.category || '');
    const matchesCategory = selectedCategory === 'all' || catName === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Pagination Calculations
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredProducts.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredProducts.length / recordsPerPage);

  const columns = [
    {
      key: 'product',
      header: 'Product',
      render: (item: any) => (
        <div className="flex items-center gap-4">
          <img
            src={item.image}
            alt={item.name}
            className="w-14 h-14 object-cover rounded-xl border border-gray-100 shadow-3xs"
          />
          <div>
            <p className="font-semibold text-gray-900">{item.name}</p>
            <p className="inline-block font-mono text-[9px] bg-indigo-50 text-indigo-750 border border-indigo-150 px-1.5 py-0.5 rounded-md mt-1">{item.sku || 'NO SKU'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (item: any) => {
        const catName = typeof item.category === 'object' && item.category
          ? item.category.name
          : (item.category || '');
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wide">
            {catName || 'General'}
          </span>
        );
      }
    },
    {
      key: 'price',
      header: 'Price',
      render: (item: any) => (
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-50 text-purple-750 border border-purple-100 shadow-3xs">
          ₹{item.price.toFixed(2)}
        </span>
      ),
    },
    {
      key: 'stock',
      header: 'Stock',
      render: (item: any) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
          item.stock < 10
            ? 'bg-rose-50 text-rose-700 border-rose-200'
            : 'bg-emerald-50 text-emerald-700 border-emerald-250'
        }`}>
          {item.stock} Left
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: any) => <StatusBadge status={item.status} />,
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (item: any) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            icon={Copy}
            className="!text-blue-600 hover:!text-blue-800 hover:!bg-blue-50"
            onClick={(e) => {
              e.stopPropagation();
              handleCopyTrigger(item._id);
            }}
            title="Duplicate Product"
          />
          <Button 
            variant="ghost" 
            size="sm" 
            icon={Edit} 
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/products/${item._id}/edit`);
            }} 
          />
          <Button
            variant="ghost"
            size="sm"
            icon={Trash2}
            className="!text-rose-600 hover:!text-rose-750 hover:!bg-rose-50"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteTrigger(item._id);
            }}
          />
        </div>
      ),
    },
  ];

  const categories = [
    'all',
    ...new Set(
      products.map((p) =>
        typeof p.category === 'object' && p.category ? p.category.name : (p.category || '')
      )
    ),
  ].filter(Boolean);

  return (
    <AdminLayout>
      <div className="space-y-6 pt-2">
        {/* Colorful Metric Cards for Products */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-indigo-50/70 border border-indigo-200/80 p-4 rounded-2xl shadow-xs text-left hover:shadow-md transition-all">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-800 block">Total Catalog</span>
            <div className="flex items-baseline justify-between mt-1.5">
              <span className="text-2xl font-extrabold text-indigo-600 font-display">{products.length}</span>
              <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200">Products</span>
            </div>
            <span className="text-[10px] font-medium text-indigo-500 mt-1 block">Catalog Inventory</span>
          </div>

          <div className="bg-emerald-50/70 border border-emerald-200/80 p-4 rounded-2xl shadow-xs text-left hover:shadow-md transition-all">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block">Active Listed</span>
            <div className="flex items-baseline justify-between mt-1.5">
              <span className="text-2xl font-extrabold text-emerald-600 font-display">
                {products.filter((p: any) => p.status?.toLowerCase() === 'active').length}
              </span>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">Live</span>
            </div>
            <span className="text-[10px] font-medium text-emerald-500 mt-1 block">Visible in Store</span>
          </div>

          <div className="bg-amber-50/70 border border-amber-200/80 p-4 rounded-2xl shadow-xs text-left hover:shadow-md transition-all">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 block">Low Stock Alert</span>
            <div className="flex items-baseline justify-between mt-1.5">
              <span className="text-2xl font-extrabold text-amber-600 font-display">
                {products.filter((p: any) => (p.stock || 0) <= 5 && (p.stock || 0) > 0).length}
              </span>
              <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded border border-amber-200">≤ 5 Units</span>
            </div>
            <span className="text-[10px] font-medium text-amber-500 mt-1 block">Restock Warning</span>
          </div>

          <div className="bg-rose-50/70 border border-rose-200/80 p-4 rounded-2xl shadow-xs text-left hover:shadow-md transition-all">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800 block">Out of Stock</span>
            <div className="flex items-baseline justify-between mt-1.5">
              <span className="text-2xl font-extrabold text-rose-600 font-display">
                {products.filter((p: any) => (p.stock || 0) === 0).length}
              </span>
              <span className="text-[10px] font-bold bg-rose-100 text-rose-700 px-2 py-0.5 rounded border border-rose-200">0 Units</span>
            </div>
            <span className="text-[10px] font-medium text-rose-500 mt-1 block">Requires Inventory</span>
          </div>
        </div>

        <Card>
          <div className="flex flex-wrap items-center justify-start gap-4 mb-6">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-12 pr-4 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-500 text-slate-800 placeholder-slate-400 text-sm h-10"
              />
            </div>
            <div className="flex items-center gap-2.5">
              <Filter size={18} className="text-slate-400" />
              <Select
                value={selectedCategory}
                onChange={(val) => {
                  setSelectedCategory(val);
                  setCurrentPage(1);
                }}
                hClass="h-10"
                className="w-36"
                options={categories.map((cat) => ({
                  value: cat,
                  label: cat === 'all' ? 'All Categories' : cat,
                }))}
              />
            </div>
            <Button 
              icon={Plus} 
              size="sm" 
              onClick={() => navigate('/admin/products/create')}
              className="h-10 px-4 rounded-xl flex items-center justify-center font-semibold text-sm whitespace-nowrap"
            >
              Add Product
            </Button>
          </div>

          <DataTable
            columns={columns}
            data={currentRecords}
            loading={loading}
            keyExtractor={(item: any) => item._id}
            onRowClick={(item: any) => navigate(`/admin/products/${item._id}`)}
          />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalRecords={filteredProducts.length}
            recordsPerPage={recordsPerPage}
            onPageChange={setCurrentPage}
            onRecordsPerPageChange={(limit) => {
              // Custom wrapper state limits setting
              const setLimit = (val: number) => {
                // In products list page, setRecordsPerPage is local state
                // Let's set it
                (setRecordsPerPage as any)(val);
              };
              setLimit(limit);
            }}
            indexOfFirstRecord={indexOfFirstRecord}
            indexOfLastRecord={indexOfLastRecord}
          />
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4 border border-gray-100">
            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-gray-900">Delete Product</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Are you sure you want to permanently delete this product? This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setItemToDelete(null);
                }}
                className="flex-1 py-2.5 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold text-xs rounded-xl border border-gray-200 transition-colors cursor-pointer focus:outline-none"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (itemToDelete) {
                    await confirmDeleteProduct(itemToDelete);
                  }
                  setDeleteModalOpen(false);
                  setItemToDelete(null);
                }}
                className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-750 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer focus:outline-none"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Copy Confirmation Modal */}
      {copyModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4 border border-gray-100">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
              <Copy size={22} />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-gray-900">Copy Product?</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-sans">
                Are you sure you want to duplicate this product? It will be created with an inactive status.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setCopyModalOpen(false);
                  setItemToCopy(null);
                }}
                className="flex-1 py-2.5 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold text-xs rounded-xl border border-gray-200 transition-colors cursor-pointer focus:outline-none"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (itemToCopy) {
                    await confirmCopyProduct(itemToCopy);
                  }
                  setCopyModalOpen(false);
                  setItemToCopy(null);
                }}
                className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-755 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer focus:outline-none"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default ProductsList;
