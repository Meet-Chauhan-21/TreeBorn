import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import AdminLayout from '../../components/admin/AdminLayout';
import Card from '../../components/admin/Card';
import Button from '../../components/admin/Button';
import { useAuth } from '../../context/AuthContext';
import { fetchPublicProductById } from '../../services/products';

const ProductForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const { accessToken } = useAuth();
  const [loading, setLoading] = useState(isEdit);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    oldPrice: '',
    discount: '',
    stock: '',
    sku: '',
    status: 'active',
    isBestSeller: false,
    isNewArrival: false,
    image: '',
    hoverImage: '',
    imagesText: '',
    rating: '',
    reviewsCount: '',
    ingredientsText: '',
    benefitsText: '',
  });

  useEffect(() => {
    if (isEdit && id && accessToken) {
      const fetchProduct = async () => {
        try {
          const product = await fetchPublicProductById(id);
          if (product) {
            setFormData({
              name: product.name,
              description: product.description,
              category: product.category,
              price: product.price.toString(),
              oldPrice: product.oldPrice?.toString() || '',
              discount: product.discount?.toString() || '',
              stock: product.stock?.toString() || '',
              sku: product.sku || '',
              status: product.status || 'active',
              isBestSeller: Boolean(product.isBestSeller),
              isNewArrival: Boolean(product.isNewArrival ?? product.isNew),
              image: product.image,
              hoverImage: product.hoverImage || '',
              imagesText: product.images?.join('\n') || '',
              rating: product.rating.toString(),
              reviewsCount: product.reviewsCount.toString(),
              ingredientsText: product.ingredients?.join('\n') || '',
              benefitsText: product.benefits?.join('\n') || '',
            });
          }
        } catch (error) {
          console.error('Error fetching product:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchProduct();
    }
  }, [isEdit, id, accessToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parseList = (value: string) =>
      value
        .split(/\n|,/)
        .map((item) => item.trim())
        .filter(Boolean);
    
    try {
      const url = isEdit 
        ? `http://localhost:5000/api/admin/products/${id}`
        : 'http://localhost:5000/api/admin/products';
      
      const response = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          oldPrice: formData.oldPrice ? parseFloat(formData.oldPrice) : null,
          discount: formData.discount ? parseInt(formData.discount, 10) : 0,
          stock: parseInt(formData.stock),
          rating: formData.rating ? parseFloat(formData.rating) : 0,
          reviewsCount: formData.reviewsCount ? parseInt(formData.reviewsCount, 10) : 0,
          images: parseList(formData.imagesText),
          ingredients: parseList(formData.ingredientsText),
          benefits: parseList(formData.benefitsText),
          hoverImage: formData.hoverImage || formData.image,
        })
      });
      
      if (response.ok) {
        toast.success(isEdit ? 'Product updated successfully' : 'Product created successfully');
        navigate('/admin/products');
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to save product');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product');
    }
  };

  const categories = ['Cleansers', 'Toners', 'Serums', 'Moisturizers', 'Face Oils', 'Masks'];

  if (loading) {
    return (
      <AdminLayout title="Edit Product">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={isEdit ? 'Edit Product' : 'Create Product'}>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button type="button" variant="ghost" icon={ArrowLeft} onClick={() => navigate('/admin/products')}>
            Back
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card title="Product Details">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      placeholder="Enter product name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary min-h-[150px] resize-none"
                      placeholder="Enter product description"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Hover Image URL</label>
                      <input
                        type="text"
                        value={formData.hoverImage}
                        onChange={(e) => setFormData({ ...formData, hoverImage: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        placeholder="https://example.com/image-alt.jpg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Discount (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.discount}
                        onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        placeholder="15"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        required
                      >
                        <option value="">Select category</option>
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">SKU</label>
                      <input
                        type="text"
                        value={formData.sku}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        placeholder="SKU-001"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Rating</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="5"
                        value={formData.rating}
                        onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        placeholder="4.8"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Reviews Count</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.reviewsCount}
                        onChange={(e) => setFormData({ ...formData, reviewsCount: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        placeholder="120"
                      />
                    </div>
                  </div>
                </div>
              </Card>

              <Card title="Pricing & Inventory">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      placeholder="85.00"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Compare At Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.oldPrice}
                      onChange={(e) => setFormData({ ...formData, oldPrice: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      placeholder="110.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Stock Quantity</label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      placeholder="100"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </Card>

              <Card title="Ingredients & Benefits">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Image Gallery URLs</label>
                    <textarea
                      value={formData.imagesText}
                      onChange={(e) => setFormData({ ...formData, imagesText: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary min-h-[120px] resize-none"
                      placeholder="One image URL per line"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Ingredients</label>
                    <textarea
                      value={formData.ingredientsText}
                      onChange={(e) => setFormData({ ...formData, ingredientsText: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary min-h-[120px] resize-none"
                      placeholder="One ingredient per line"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Benefits</label>
                    <textarea
                      value={formData.benefitsText}
                      onChange={(e) => setFormData({ ...formData, benefitsText: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary min-h-[120px] resize-none"
                      placeholder="One benefit per line"
                    />
                  </div>
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              <Card title="Product Image">
                <div className="space-y-4">
                  {formData.image && (
                    <img
                      src={formData.image}
                      alt="Product"
                      className="w-full h-48 object-cover rounded-xl"
                    />
                  )}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Image URL</label>
                    <input
                      type="text"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
              </Card>

              <Card title="Product Options">
                <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isBestSeller}
                      onChange={(e) => setFormData({ ...formData, isBestSeller: e.target.checked })}
                      className="w-5 h-5 text-primary rounded focus:ring-primary"
                    />
                    <span className="text-sm font-medium text-gray-700">Mark as Best Seller</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isNewArrival}
                      onChange={(e) => setFormData({ ...formData, isNewArrival: e.target.checked })}
                      className="w-5 h-5 text-primary rounded focus:ring-primary"
                    />
                    <span className="text-sm font-medium text-gray-700">Mark as New</span>
                  </label>
                </div>
              </Card>

              <div className="flex gap-3">
                <Button type="button" variant="secondary" className="flex-1" onClick={() => navigate('/admin/products')}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  {isEdit ? 'Update Product' : 'Create Product'}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default ProductForm;
