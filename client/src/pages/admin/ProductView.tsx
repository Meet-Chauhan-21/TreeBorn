import React, { useEffect, useState } from 'react';
import { ArrowLeft, Edit, Package, Tag, Star, Truck, ShieldCheck } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import Card from '../../components/admin/Card';
import Button from '../../components/admin/Button';
import StatusBadge from '../../components/admin/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { fetchPublicProductById } from '../../services/products';

const ProductView: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { accessToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<any | null>(null);

  useEffect(() => {
    if (!id || !accessToken) return;

    const loadProduct = async () => {
      try {
        const data = await fetchPublicProductById(id);
        setProduct(data);
      } catch (error) {
        console.error('Error loading product:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id, accessToken]);

  if (loading) {
    return (
      <AdminLayout title="View Product">
        <div className="flex items-center justify-center min-h-100">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  if (!product) {
    return (
      <AdminLayout title="View Product">
        <Card>
          <div className="text-center py-10 space-y-4">
            <p className="text-gray-500">Product not found.</p>
            <Button type="button" variant="secondary" onClick={() => navigate('/admin/products')}>
              Back to Products
            </Button>
          </div>
        </Card>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="View Product">
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <Button type="button" variant="ghost" icon={ArrowLeft} onClick={() => navigate('/admin/products')}>
            Back
          </Button>
          <Button type="button" icon={Edit} onClick={() => navigate(`/admin/products/${product.id}/edit`)}>
            Edit Product
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-80 object-cover rounded-3xl border border-gray-100"
                />
                {product.hoverImage && (
                  <img
                    src={product.hoverImage}
                    alt={`${product.name} alternate`}
                    className="w-full h-44 object-cover rounded-3xl border border-gray-100 mt-4"
                  />
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <StatusBadge status={product.status} />
                  {product.isBestSeller && <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">Best Seller</span>}
                  {product.isNewArrival && <span className="px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-semibold">New</span>}
                </div>

                <div>
                  <p className="text-sm uppercase tracking-widest text-gray-400 font-semibold">{product.category}</p>
                  <h1 className="text-3xl font-bold text-gray-900 mt-1">{product.name}</h1>
                </div>

                <p className="text-gray-600 leading-relaxed">{product.description}</p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-gray-50">
                    <p className="text-xs uppercase text-gray-400 font-semibold">Price</p>
                    <p className="text-2xl font-bold text-gray-900">${Number(product.price).toFixed(2)}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-gray-50">
                    <p className="text-xs uppercase text-gray-400 font-semibold">Stock</p>
                    <p className="text-2xl font-bold text-gray-900">{product.stock ?? 0}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-gray-50">
                    <p className="text-xs uppercase text-gray-400 font-semibold">Rating</p>
                    <p className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Star size={18} className="text-amber-500" /> {Number(product.rating || 0).toFixed(1)}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-gray-50">
                    <p className="text-xs uppercase text-gray-400 font-semibold">Reviews</p>
                    <p className="text-2xl font-bold text-gray-900">{product.reviewsCount ?? 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div className="space-y-6">
            <Card title="Product Info">
              <div className="space-y-4 text-sm text-gray-600">
                <div className="flex items-center gap-3"><Tag size={16} className="text-primary" /> SKU: {product.sku || 'N/A'}</div>
                <div className="flex items-center gap-3"><Package size={16} className="text-primary" /> Stock: {product.stock ?? 0}</div>
                <div className="flex items-center gap-3"><ShieldCheck size={16} className="text-primary" /> Status: {product.status || 'active'}</div>
                <div className="flex items-center gap-3"><Truck size={16} className="text-primary" /> Discount: {product.discount ?? 0}%</div>
              </div>
            </Card>

            <Card title="Ingredients">
              <div className="flex flex-wrap gap-2">
                {(product.ingredients || []).length > 0 ? (
                  product.ingredients.map((item: string) => (
                    <span key={item} className="px-3 py-1.5 rounded-full bg-primary/5 text-primary text-xs font-medium">
                      {item}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No ingredients added.</p>
                )}
              </div>
            </Card>

            <Card title="Benefits">
              <ul className="space-y-2">
                {(product.benefits || []).length > 0 ? (
                  product.benefits.map((item: string) => (
                    <li key={item} className="text-sm text-gray-600">• {item}</li>
                  ))
                ) : (
                  <li className="text-sm text-gray-500">No benefits added.</li>
                )}
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ProductView;
