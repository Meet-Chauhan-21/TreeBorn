import React, { useState, useEffect } from 'react';
import { Search, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import AdminLayout from '../../components/admin/AdminLayout';
import Card from '../../components/admin/Card';
import Button from '../../components/admin/Button';
import DataTable from '../../components/admin/DataTable';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config';

const OrderStatusSelect: React.FC<{
  orderId: string;
  orderNumber: string;
  initialStatus: string;
  accessToken: string | null;
  onStatusUpdated: (newStatus: string) => void;
}> = ({ orderId, orderNumber, initialStatus, accessToken, onStatusUpdated }) => {
  const [status, setStatus] = useState(initialStatus);
  const [updating, setUpdating] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    if (!accessToken) return;
    setUpdating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        setStatus(newStatus);
        onStatusUpdated(newStatus);
        toast.success(`Order ${orderNumber} status updated to ${newStatus}`);
      } else {
        toast.error('Failed to update order status');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const currentStatus = status.toLowerCase();
  const bgClass = 
    currentStatus === 'placed' || currentStatus === 'completed' ? 'bg-blue-50 text-blue-700 font-semibold' :
    currentStatus === 'delivered' ? 'bg-green-50 text-green-700 font-semibold' :
    currentStatus === 'processing' ? 'bg-purple-50 text-purple-700 font-semibold' :
    currentStatus === 'cancelled' ? 'bg-red-50 text-red-700 font-semibold' : 'bg-gray-100 text-gray-700 font-semibold';

  return (
    <select
      value={status}
      disabled={updating}
      onChange={(e) => handleStatusChange(e.target.value)}
      className={`px-3 py-1.5 rounded-full text-xs border border-transparent cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 ${bgClass} ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {['Placed', 'Processing', 'Delivered', 'Cancelled'].map((opt) => (
        <option key={opt} value={opt} className="bg-white text-gray-800 font-normal">
          {opt}
        </option>
      ))}
    </select>
  );
};

const OrdersList: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { accessToken } = useAuth();

  useEffect(() => {
    const fetchOrders = async () => {
      if (!accessToken) return;
      
      try {
        const response = await fetch(`${API_BASE_URL}/admin/orders`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          setOrders(data.orders);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [accessToken]);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (order.user?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    { key: 'orderNumber', header: 'Order ID', render: (item: any) => <span className="font-semibold text-primary">{item.orderNumber}</span> },
    { 
      key: 'customer', 
      header: 'Customer',
      render: (item: any) => item.user?.name || 'N/A'
    },
    { 
      key: 'date', 
      header: 'Date',
      render: (item: any) => new Date(item.createdAt).toLocaleDateString()
    },
    {
      key: 'total',
      header: 'Total',
      render: (item: any) => <span className="font-bold text-gray-900">₹{item.totals.total.toFixed(2)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: any) => (
        <OrderStatusSelect
          orderId={item._id}
          orderNumber={item.orderNumber}
          initialStatus={item.status}
          accessToken={accessToken}
          onStatusUpdated={(newStatus) => {
            setOrders((prev) =>
              prev.map((o) => (o._id === item._id ? { ...o, status: newStatus } : o))
            );
          }}
        />
      ),
    },
    {
      key: 'payment',
      header: 'Payment',
      render: (item: any) => (
        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
          item.payment?.status === 'paid' ? 'bg-green-50 text-green-700' :
          item.payment?.status === 'pending' ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'
        }`}>
          {item.payment?.status || 'pending'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (item: any) => (
        <Button variant="ghost" size="sm" icon={Eye} onClick={() => navigate(`/admin/orders/${item._id}`)} />
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">All Orders</h2>
            <p className="text-gray-500">Manage customer orders</p>
          </div>
        </div>

        <Card>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full md:w-48 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <DataTable
            columns={columns}
            data={filteredOrders}
            loading={loading}
            keyExtractor={(item: any) => item._id}
          />
        </Card>
      </div>
    </AdminLayout>
  );
};

export default OrdersList;
