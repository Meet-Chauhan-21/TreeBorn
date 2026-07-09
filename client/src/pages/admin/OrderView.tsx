import React, { useEffect, useState } from 'react';
import { ArrowLeft, Save, User, Phone, CalendarDays, Package } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import AdminLayout from '../../components/admin/AdminLayout';
import Card from '../../components/admin/Card';
import Button from '../../components/admin/Button';
import StatusBadge from '../../components/admin/StatusBadge';
import { useAuth } from '../../context/AuthContext';

const statusOptions = ['Placed', 'Processing', 'Delivered', 'Cancelled'];

const OrderView: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { accessToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [order, setOrder] = useState<any | null>(null);
  const [status, setStatus] = useState('Placed');

  useEffect(() => {
    if (!id || !accessToken) return;

    const loadOrder = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/admin/orders/${id}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (response.ok) {
          const data = await response.json();
          setOrder(data.order);
          setStatus(data.order.status);
        }
      } catch (error) {
        console.error('Error loading order:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [id, accessToken]);

  const handleStatusSave = async () => {
    if (!id || !accessToken) return;

    setSaving(true);
    try {
      const response = await fetch(`http://localhost:5000/api/admin/orders/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        const data = await response.json();
        setOrder(data.order);
        toast.success('Order status updated successfully');
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Error saving order status:', error);
      toast.error('Failed to update order status');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Order View">
        <div className="flex items-center justify-center min-h-100">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  if (!order) {
    return (
      <AdminLayout title="Order View">
        <Card>
          <div className="text-center py-10 space-y-4">
            <p className="text-gray-500">Order not found.</p>
            <Button type="button" variant="secondary" onClick={() => navigate('/admin/orders')}>
              Back to Orders
            </Button>
          </div>
        </Card>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Order View">
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <Button type="button" variant="ghost" icon={ArrowLeft} onClick={() => navigate('/admin/orders')}>
            Back
          </Button>
          <div className="flex items-center gap-3">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {statusOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <Button type="button" icon={Save} onClick={handleStatusSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Status'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2" title={`Order ${order.orderNumber}`}>
            <div className="space-y-6">
              <div className="flex items-center gap-2 flex-wrap">
                <StatusBadge status={order.status} />
                <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                  {order.payment?.status || 'pending'} payment
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-3"><User size={16} className="text-primary" /> {order.user?.name || 'N/A'}</div>
                <div className="flex items-center gap-3"><Phone size={16} className="text-primary" /> {order.user?.phone || order.shippingAddress?.phone || 'N/A'}</div>
                <div className="flex items-center gap-3"><CalendarDays size={16} className="text-primary" /> {new Date(order.createdAt).toLocaleString()}</div>
                <div className="flex items-center gap-3"><Package size={16} className="text-primary" /> {order.items?.length || 0} items</div>
              </div>

              <div className="space-y-4">
                {order.items?.map((item: any) => (
                  <div key={`${item.productId}-${item.selectedSize}`} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50">
                    <div>
                      <p className="font-semibold text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">Size: {item.selectedSize} • Qty: {item.quantity}</p>
                    </div>
                    <p className="font-bold text-primary">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <div className="space-y-6">
            <Card title="Shipping Address">
              <div className="space-y-2 text-sm text-gray-600">
                <p className="font-semibold text-gray-900">{order.shippingAddress?.name}</p>
                <p>{order.shippingAddress?.phone}</p>
                <p>{order.shippingAddress?.street}</p>
                <p>{order.shippingAddress?.district}, {order.shippingAddress?.state}</p>
                <p>{order.shippingAddress?.country} - {order.shippingAddress?.zip}</p>
              </div>
            </Card>

            <Card title="Totals">
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between"><span className="text-gray-500">Subtotal</span><span className="font-semibold">${order.totals?.subtotal?.toFixed(2)}</span></div>
                <div className="flex items-center justify-between"><span className="text-gray-500">Shipping</span><span className="font-semibold">${order.totals?.shipping?.toFixed(2)}</span></div>
                <div className="flex items-center justify-between"><span className="text-gray-500">Tax</span><span className="font-semibold">${order.totals?.tax?.toFixed(2)}</span></div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-base"><span className="font-bold text-gray-900">Total</span><span className="font-bold text-primary">${order.totals?.total?.toFixed(2)}</span></div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default OrderView;
