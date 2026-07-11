import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  UsersRound,
  Clock,
  Plus
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import AdminLayout from '../../components/admin/AdminLayout';
import StatsCard from '../../components/admin/StatsCard';
import Card from '../../components/admin/Card';
import StatusBadge from '../../components/admin/StatusBadge';
import Button from '../../components/admin/Button';
import DataTable from '../../components/admin/DataTable';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config';

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    products: 0,
    users: 0
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const { accessToken } = useAuth();
  const navigate = useNavigate();

  // Mock chart data for now
  const revenueData = [
    { month: 'Jan', revenue: 4000, orders: 240 },
    { month: 'Feb', revenue: 3000, orders: 139 },
    { month: 'Mar', revenue: 5000, orders: 980 },
    { month: 'Apr', revenue: 4500, orders: 390 },
    { month: 'May', revenue: 6000, orders: 480 },
    { month: 'Jun', revenue: 7500, orders: 590 },
  ];

  const monthlySalesData = [
    { name: 'Week 1', sales: 4000 },
    { name: 'Week 2', sales: 3000 },
    { name: 'Week 3', sales: 5000 },
    { name: 'Week 4', sales: 6500 },
  ];

  const recentActivity = [
    { type: 'order', text: 'New order received', time: '5 min ago' },
    { type: 'product', text: 'Product restocked', time: '15 min ago' },
    { type: 'user', text: 'New user registered', time: '1 hour ago' },
    { type: 'order', text: 'Order shipped', time: '2 hours ago' },
    { type: 'order', text: 'Order delivered', time: '3 hours ago' },
  ];

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!accessToken) return;

      try {
        const response = await fetch(`${API_BASE_URL}/admin/dashboard`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });

        if (response.ok) {
          const data = await response.json();
          setStats(data.stats);
          setRecentOrders(data.recentOrders);
          setTopProducts(data.topProducts);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [accessToken]);

  const orderColumns = [
    { key: 'orderNumber', header: 'Order ID' },
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
      render: (item: any) => `₹${item.totals.total.toFixed(2)}`
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: any) => <StatusBadge status={item.status.toLowerCase() as any} />,
    },
  ];

  if (loading) {
    return (
      <AdminLayout title="Dashboard">
        <div className="flex items-center justify-center min-h-100">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Revenue"
            value={`₹${stats.revenue.toLocaleString()}`}
            trend={{ value: '23.5%', positive: true }}
            icon="fa-solid fa-chart-line"
            color="purple"
          />
          <StatsCard
            title="Orders"
            value={stats.orders.toLocaleString()}
            trend={{ value: '15.2%', positive: true }}
            icon="fa-solid fa-arrow-down-wide-short"
            color="blue"
          />
          <StatsCard
            title="Products"
            value={stats.products.toLocaleString()}
            trend={{ value: '3.1%', positive: true }}
            icon="fa-solid fa-boxes-stacked"
            color="orange"
          />
          <StatsCard
            title="Users"
            value={stats.users.toLocaleString()}
            trend={{ value: '8.7%', positive: true }}
            icon="fa-solid fa-users"
            color="green"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card title="Revenue Trend" className="lg:col-span-2">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="space-y-6">
            <Card title="Quick Actions">
              <div className="space-y-3">
                <Button icon={Plus} className="w-full justify-center" onClick={() => navigate('/admin/products/create')}>
                  Add Product
                </Button>
                <Button variant="secondary" icon={ClipboardList} className="w-full justify-center" onClick={() => navigate('/admin/orders')}>
                  View Orders
                </Button>
                <Button variant="ghost" icon={UsersRound} className="w-full justify-center" onClick={() => navigate('/admin/users')}>
                  Manage Users
                </Button>
              </div>
            </Card>

            <Card title="Monthly Sales">
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlySalesData}>
                    <Bar dataKey="sales" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card title="Recent Orders" className="lg:col-span-2">
            <DataTable columns={orderColumns} data={recentOrders} />
          </Card>

          <Card title="Recent Activity">
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className={`w-1.5 h-1.5 rounded-full mt-2.5 ${activity.type === 'order' ? 'bg-indigo-500' :
                      activity.type === 'product' ? 'bg-emerald-500' : 'bg-violet-500'
                    }`} />
                  <div className="flex-1 text-left">
                    <p className="text-sm text-slate-800 font-medium leading-tight">{activity.text}</p>
                    <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-sans">
                      <Clock size={11} />
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card title="Top Selling Products">
          <div className="space-y-3">
            {topProducts.map((product, index) => (
              <div key={product._id || index} className="flex items-center justify-between p-3.5 bg-slate-50/60 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-slate-100 border border-slate-200/50 rounded-lg flex items-center justify-center text-slate-800 font-bold text-xs shadow-3xs">
                    {index + 1}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-slate-900 leading-tight">{product.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{product.sales} units sold</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-950">₹{product.revenue?.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
