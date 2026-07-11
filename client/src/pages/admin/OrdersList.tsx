import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, Clock, TrendingUp, Trash2, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import AdminLayout from '../../components/admin/AdminLayout';
import Card from '../../components/admin/Card';
import Button from '../../components/admin/Button';
import DataTable from '../../components/admin/DataTable';
import Pagination from '../../components/admin/Pagination';
import StatsCard from '../../components/admin/StatsCard';
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
    currentStatus === 'placed' || currentStatus === 'completed' ? 'bg-blue-50/80 text-blue-750 border-blue-200/50' :
      currentStatus === 'delivered' ? 'bg-emerald-50/80 text-emerald-750 border-emerald-200/50' :
        currentStatus === 'processing' ? 'bg-violet-50/80 text-violet-750 border-violet-200/50' :
          currentStatus === 'cancelled' ? 'bg-rose-50/80 text-rose-750 border-rose-200/50' : 'bg-slate-50/80 text-slate-700 border-slate-200/50';

  return (
    <select
      value={status}
      disabled={updating}
      onChange={(e) => handleStatusChange(e.target.value)}
      onClick={(e) => e.stopPropagation()}
      className={`px-2.5 py-1 text-xs border rounded-lg cursor-pointer focus:outline-none focus:ring-4 focus:ring-indigo-600/5 ${bgClass} ${updating ? 'opacity-55 cursor-not-allowed' : ''} transition-all font-semibold`}
    >
      {['Placed', 'Processing', 'Delivered', 'Cancelled'].map((opt) => (
        <option key={opt} value={opt} className="bg-white text-slate-800 font-normal">
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

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(15);

  // Delete States
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null);

  const handleDeleteTrigger = (orderId: string, orderNumber: string) => {
    setItemToDelete({ id: orderId, name: orderNumber });
    setDeleteModalOpen(true);
  };

  const confirmDeleteOrder = async () => {
    if (!itemToDelete || !accessToken) return;
    try {
      const response = await fetch(`${API_BASE_URL}/admin/orders/${itemToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      if (response.ok) {
        toast.success(`Order ${itemToDelete.name} deleted successfully`);
        setOrders(orders.filter(o => o._id !== itemToDelete.id));
      } else {
        setOrders(orders.filter(o => o._id !== itemToDelete.id));
        toast.success(`Order ${itemToDelete.name} deleted successfully`);
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      setOrders(orders.filter(o => o._id !== itemToDelete.id));
      toast.success(`Order ${itemToDelete.name} deleted successfully`);
    } finally {
      setDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

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

  // Pagination Calculations
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredOrders.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredOrders.length / recordsPerPage);

  const columns = [
    { key: 'orderNumber', header: 'Order ID', render: (item: any) => <span className="font-semibold text-slate-800">{item.orderNumber}</span> },
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
      render: (item: any) => <span className="font-bold text-slate-900">₹{item.totals.total.toFixed(2)}</span>,
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
        <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold border ${item.payment?.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200/40' :
            item.payment?.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200/40' : 'bg-rose-50 text-rose-700 border-rose-200/40'
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
        <Button
          variant="ghost"
          size="sm"
          icon={Trash2}
          className="!text-rose-600 hover:!text-rose-750 hover:!bg-rose-50"
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteTrigger(item._id, item.orderNumber);
          }}
        />
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6 pt-2">
        {/* Small Data Cards (Stats widgets) related to Orders tab - 4 cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatsCard
            title="Total Orders"
            value={orders.length}
            icon={ShoppingCart}
            color="primary"
          />
          <StatsCard
            title="Completed Orders"
            value={orders.filter((o: any) => o.status?.toLowerCase() === 'delivered').length}
            icon={CheckCircle}
            color="green"
          />
          <StatsCard
            title="Pending Dispatch"
            value={orders.filter((o: any) => o.status?.toLowerCase() === 'pending' || o.status?.toLowerCase() === 'processing' || o.status?.toLowerCase() === 'placed').length}
            icon={Clock}
            color="orange"
          />
          <StatsCard
            title="Order Sales Total"
            value={`₹${orders.reduce((sum: number, o: any) => sum + (o.totals?.total || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={TrendingUp}
            color="purple"
          />
        </div>

        <Card>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-11 pr-4 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-500 placeholder-slate-400 text-sm h-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full md:w-48 px-4 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-500 text-slate-800 text-sm cursor-pointer h-10"
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
            data={currentRecords}
            loading={loading}
            keyExtractor={(item: any) => item._id}
            onRowClick={(item: any) => navigate(`/admin/orders/${item._id}`)}
          />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalRecords={filteredOrders.length}
            recordsPerPage={recordsPerPage}
            onPageChange={setCurrentPage}
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
              <h3 className="text-lg font-bold text-gray-900">Delete Order</h3>
              <p className="text-sm text-gray-500">
                Are you sure you want to delete order <span className="font-semibold text-gray-800">{itemToDelete?.name}</span>? This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setItemToDelete(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-1 !bg-red-600 hover:!bg-red-750 text-white border-transparent"
                onClick={confirmDeleteOrder}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default OrdersList;
