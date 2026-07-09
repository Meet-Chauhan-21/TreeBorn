import React, { useEffect, useState } from 'react';
import { ArrowLeft, Mail, Phone, CalendarDays, ShoppingBag, UserRound } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import Card from '../../components/admin/Card';
import Button from '../../components/admin/Button';
import StatusBadge from '../../components/admin/StatusBadge';
import { useAuth } from '../../context/AuthContext';

const UserView: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { accessToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    if (!id || !accessToken) return;

    const loadUser = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/admin/users/${id}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [id, accessToken]);

  if (loading) {
    return (
      <AdminLayout title="User View">
        <div className="flex items-center justify-center min-h-100">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  if (!user) {
    return (
      <AdminLayout title="User View">
        <Card>
          <div className="text-center py-10 space-y-4">
            <p className="text-gray-500">User not found.</p>
            <Button type="button" variant="secondary" onClick={() => navigate('/admin/users')}>
              Back to Users
            </Button>
          </div>
        </Card>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="User View">
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <Button type="button" variant="ghost" icon={ArrowLeft} onClick={() => navigate('/admin/users')}>
            Back
          </Button>
          <StatusBadge status={user.role === 'admin' ? 'active' : 'pending'} label={user.role === 'admin' ? 'Admin' : 'User'} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-16 h-16 bg-linear-to-br from-primary to-secondary rounded-2xl flex items-center justify-center text-white font-bold text-xl">
                {user.name?.charAt(0) || 'U'}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                <p className="text-gray-500">Customer profile details</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-3"><Mail size={16} className="text-primary" /> {user.email}</div>
              <div className="flex items-center gap-3"><Phone size={16} className="text-primary" /> {user.phone}</div>
              <div className="flex items-center gap-3"><CalendarDays size={16} className="text-primary" /> Joined {new Date(user.createdAt).toLocaleDateString()}</div>
              <div className="flex items-center gap-3"><ShoppingBag size={16} className="text-primary" /> {user.orders || 0} orders</div>
            </div>

            {user.recentOrders?.length > 0 && (
              <div className="mt-8 space-y-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><UserRound size={18} /> Recent Orders</h2>
                {user.recentOrders.map((order: any) => (
                  <div key={order._id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50">
                    <div>
                      <p className="font-semibold text-gray-900">{order.orderNumber}</p>
                      <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => navigate(`/admin/orders/${order._id}`)}>
                      View Order
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <div className="space-y-6">
            <Card title="Quick Stats">
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center justify-between"><span>Role</span><span className="font-semibold text-gray-900">{user.role}</span></div>
                <div className="flex items-center justify-between"><span>Orders</span><span className="font-semibold text-gray-900">{user.orders || 0}</span></div>
                <div className="flex items-center justify-between"><span>Phone</span><span className="font-semibold text-gray-900">{user.phone}</span></div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default UserView;
