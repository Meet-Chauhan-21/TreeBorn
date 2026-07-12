import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Trash2, Edit, AlertCircle, ShoppingBag, Eye, Plus } from 'lucide-react';
import { toast } from 'sonner';
import AdminLayout from '../../components/admin/AdminLayout';
import Card from '../../components/admin/Card';
import Button from '../../components/admin/Button';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { API_BASE_URL } from '../../config';

const CategoryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const { categories } = useStore();

  const [category, setCategory] = useState<any | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Delete Modal States
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (categories.length > 0 && id) {
      const found = categories.find((c) => (c._id || c.id) === id);
      if (found) {
        setCategory(found);
      }
    }
  }, [categories, id]);

  const fetchCategoryProducts = async () => {
    if (!accessToken || !id) return;
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/admin/products?category=${id}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      } else {
        toast.error('Failed to load products for this category.');
      }
    } catch (error) {
      console.error('Error fetching category products:', error);
      toast.error('Failed to load products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoryProducts();
  }, [accessToken, id]);

  const handleDeleteProduct = async (prodId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/products/${prodId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });

      if (response.ok) {
        toast.success('Product deleted successfully');
        setProducts((prev) => prev.filter((p) => p._id !== prodId));
      } else {
        toast.error('Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const columns = [
    {
      key: 'product',
      header: 'Product',
      render: (item: any) => (
        <div className="flex items-center gap-4">
          <img
            src={item.image}
            alt={item.name}
            className="w-12 h-12 rounded-xl object-cover bg-gray-50 border border-gray-100 flex-shrink-0"
          />
          <div>
            <span className="font-semibold text-slate-800 text-sm block leading-tight">{item.name}</span>
            <span className="text-[10px] font-mono text-slate-400 mt-0.5 block">{item.sku}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'price',
      header: 'Price',
      render: (item: any) => (
        <div className="font-semibold text-slate-800 text-sm">
          ₹{item.price.toFixed(2)}
          {item.oldPrice && (
            <span className="text-xs text-gray-400 line-through font-normal ml-2 block">
              ₹{item.oldPrice.toFixed(2)}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'stock',
      header: 'Stock',
      render: (item: any) => {
        const isOutOfStock = (item.stock || 0) <= 0;
        const isLowStock = (item.stock || 0) > 0 && (item.stock || 0) <= 10;
        return (
          <div>
            <span className={`text-sm font-semibold ${isOutOfStock ? 'text-red-650' : 'text-slate-700'}`}>
              {item.stock} units
            </span>
            {isOutOfStock && <span className="text-[10px] text-red-500 font-medium block mt-0.5">Out of Stock</span>}
            {isLowStock && <span className="text-[10px] text-amber-500 font-medium block mt-0.5">Low Stock</span>}
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: any) => <StatusBadge status={item.status} />,
    },
    {
      key: 'actions',
      header: '',
      render: (item: any) => (
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={() => navigate(`/admin/products/${item._id}`)}
            className="p-2 border border-gray-200 text-slate-500 hover:text-slate-800 rounded-xl transition cursor-pointer"
            title="View Product"
          >
            <Eye size={14} />
          </button>
          <button
            onClick={() => navigate(`/admin/products/${item._id}/edit`)}
            className="p-2 border border-gray-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-100 hover:bg-indigo-50/20 rounded-xl transition cursor-pointer"
            title="Edit Product"
          >
            <Edit size={14} />
          </button>
          <button
            onClick={() => {
              setProductToDelete(item._id);
              setDeleteModalOpen(true);
            }}
            className="p-2 border border-gray-200 text-slate-500 hover:text-red-650 hover:border-red-100 hover:bg-red-50/20 rounded-xl transition cursor-pointer"
            title="Delete Product"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  if (!category && categories.length > 0 && !loading) {
    return (
      <AdminLayout title="Category Not Found">
        <Card className="p-8 text-center space-y-4">
          <AlertCircle className="mx-auto text-red-500" size={48} />
          <h2 className="text-xl font-bold text-gray-900">Category Not Found</h2>
          <p className="text-gray-500">The category you are trying to view does not exist or has been deleted.</p>
          <Button icon={ArrowLeft} onClick={() => navigate('/admin/categories')}>
            Back to Categories
          </Button>
        </Card>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={category ? `${category.name} Products` : 'Category Detail'}>
      <div className="space-y-6">
        {/* Top bar */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" icon={ArrowLeft} onClick={() => navigate('/admin/categories')}>
            Back to Categories
          </Button>
        </div>

        {/* Category Brief Info Card */}
        {category && (
          <Card className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <img
                src={category.image}
                alt={category.altText || category.name}
                className="w-32 h-20 md:w-44 md:h-28 rounded-2xl object-cover bg-gray-50 border shadow-xs"
              />
              <div className="space-y-1.5 text-center md:text-left">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                  <h2 className="text-2xl font-bold text-slate-900">{category.name}</h2>
                  <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full tracking-widest ${
                    category.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
                  }`}>
                    {category.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-xs font-mono text-slate-400">Slug: /{category.slug} | Order: {category.sortOrder}</p>
                {category.altText && <p className="text-xs text-slate-500">SEO Alt Text: "{category.altText}"</p>}
              </div>
            </div>
          </Card>
        )}

        {/* Linked Products Table */}
        <Card title="Linked Products" icon={Package}>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 text-gray-500 font-sans space-y-3">
              <ShoppingBag className="mx-auto text-slate-300" size={40} />
              <p className="text-sm font-semibold">No products linked to this category yet.</p>
              <Button icon={Plus} onClick={() => navigate('/admin/products/create')} className="mx-auto text-xs py-2 px-4">
                Create First Product
              </Button>
            </div>
          ) : (
            <DataTable columns={columns} data={products} />
          )}
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4 border border-gray-150 animate-scale-in">
            <div className="w-12 h-12 bg-red-50 text-red-650 rounded-full flex items-center justify-center mx-auto shadow-inner">
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
                  setProductToDelete(null);
                }}
                className="flex-1 py-2.5 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold text-xs rounded-xl border border-gray-200 transition cursor-pointer focus:outline-none"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (productToDelete) {
                    await handleDeleteProduct(productToDelete);
                  }
                  setDeleteModalOpen(false);
                  setProductToDelete(null);
                }}
                className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-xl transition cursor-pointer focus:outline-none"
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

export default CategoryDetail;
