import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Edit, Trash2, Package, CheckCircle, AlertTriangle } from 'lucide-react';
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
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
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
            className="w-14 h-14 object-cover rounded-xl"
          />
          <div>
            <p className="font-semibold text-gray-900">{item.name}</p>
            <p className="text-sm text-gray-500">{item.sku}</p>
          </div>
        </div>
      ),
    },
    { key: 'category', header: 'Category' },
    {
      key: 'price',
      header: 'Price',
      render: (item: any) => (
        <span className="font-semibold text-gray-900">₹{item.price.toFixed(2)}</span>
      ),
    },
    {
      key: 'stock',
      header: 'Stock',
      render: (item: any) => (
        <span className={`font-semibold ${item.stock < 10 ? 'text-red-600' : 'text-gray-900'}`}>
          {item.stock}
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

  const categories = ['all', ...new Set(products.map((p) => p.category))];

  return (
    <AdminLayout>
      <div className="space-y-6 pt-2">
        {/* Small Data Cards (Stats widgets) related to Products tab - 4 cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatsCard
            title="Total Products"
            value={products.length}
            icon={Package}
            color="primary"
          />
          <StatsCard
            title="Active Products"
            value={products.filter((p: any) => p.status?.toLowerCase() === 'active').length}
            icon={CheckCircle}
            color="green"
          />
          <StatsCard
            title="Low Stock"
            value={products.filter((p: any) => (p.stock || 0) <= 5 && (p.stock || 0) > 0).length}
            icon={AlertTriangle}
            color="orange"
          />
          <StatsCard
            title="Out of Stock"
            value={products.filter((p: any) => (p.stock || 0) === 0).length}
            icon={AlertTriangle}
            color="orange"
          />
        </div>

        <Card>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="relative w-full md:w-80">
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
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <Filter size={18} className="text-slate-400" />
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-500 text-slate-800 text-sm cursor-pointer h-10"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
              <Button 
                icon={Plus} 
                size="sm" 
                onClick={() => navigate('/admin/products/create')}
                className="h-10 px-4 rounded-xl flex items-center justify-center font-semibold text-sm whitespace-nowrap"
              >
                Add Product
              </Button>
            </div>
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
    </AdminLayout>
  );
};

export default ProductsList;
