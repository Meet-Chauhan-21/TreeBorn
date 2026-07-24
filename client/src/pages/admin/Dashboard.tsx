import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  UsersRound,
  Clock,
  Plus,
  ShoppingCart,
  CheckCircle,
  TrendingUp
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar
} from 'recharts';
import AdminLayout from '../../components/admin/AdminLayout';

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
    users: 0,
    totalOnlinePayments: 0,
    codOrders: 0,
    paidOrders: 0,
    failedPayments: 0,
    refundedOrders: 0,
    revenueByMethod: {
      online: 0,
      cod: 0
    }
  });

  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const { accessToken } = useAuth();
  const navigate = useNavigate();

  // Original Revenue Trend Data
  const revenueData = [
    { month: 'Jan', revenue: 4200 },
    { month: 'Feb', revenue: 5800 },
    { month: 'Mar', revenue: 7200 },
    { month: 'Apr', revenue: 6100 },
    { month: 'May', revenue: 8900 },
    { month: 'Jun', revenue: 10400 },
    { month: 'Jul', revenue: stats.revenue || 12500 }
  ];

  const paymentBreakdownData = [
    { name: 'Paid Orders', value: stats.paidOrders || 0, color: '#10b981' },
    { name: 'COD Orders', value: stats.codOrders || 0, color: '#f59e0b' },
    { name: 'Refunded Orders', value: stats.refundedOrders || 0, color: '#a855f7' },
    { name: 'Failed Orders', value: stats.failedPayments || 0, color: '#ef4444' }
  ];

  const paymentBreakdownBarData = [
    {
      name: 'Online (Razorpay)',
      Revenue: stats.revenueByMethod?.online || 0,
      Orders: stats.totalOnlinePayments || 0,
    },
    {
      name: 'Cash on Delivery',
      Revenue: stats.revenueByMethod?.cod || 0,
      Orders: stats.codOrders || 0,
    }
  ];

  const revenueSparklineData = [
    { value: Math.round((stats.revenue || 4699) * 0.45) },
    { value: Math.round((stats.revenue || 4699) * 0.6) },
    { value: Math.round((stats.revenue || 4699) * 0.55) },
    { value: Math.round((stats.revenue || 4699) * 0.75) },
    { value: Math.round((stats.revenue || 4699) * 0.7) },
    { value: Math.round((stats.revenue || 4699) * 0.9) },
    { value: stats.revenue || 4699 }
  ];

  const ordersSparklineData = [
    { value: Math.round((stats.orders || 4) * 0.3) },
    { value: Math.round((stats.orders || 4) * 0.5) },
    { value: Math.round((stats.orders || 4) * 0.4) },
    { value: Math.round((stats.orders || 4) * 0.7) },
    { value: Math.round((stats.orders || 4) * 0.6) },
    { value: Math.round((stats.orders || 4) * 0.8) },
    { value: stats.orders || 4 }
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
          setStats((prev) => ({ ...prev, ...data.stats }));
          setRecentOrders(data.recentOrders || []);
          setTopProducts(data.topProducts || []);
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
      render: (item: any) => item.user?.name || item.shippingAddress?.name || 'N/A'
    },
    {
      key: 'date',
      header: 'Date',
      render: (item: any) => new Date(item.createdAt).toLocaleDateString()
    },
    {
      key: 'method',
      header: 'Method',
      render: (item: any) => (
        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
          item.payment?.method === 'razorpay' ? 'bg-indigo-100 text-indigo-700' :
          item.payment?.method === 'card' ? 'bg-purple-100 text-purple-700' :
          'bg-emerald-100 text-emerald-700'
        }`}>
          {item.payment?.method || 'N/A'}
        </span>
      )
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
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-6">
               {/* Top Overview Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (Stats: Revenue, Orders, Combined Activity) */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
            
            {/* Total Revenue Card with Sparkline */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 saas-shadow hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)] transition-all duration-200 flex flex-col justify-between h-full group">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-display">Total Revenue</span>
                  <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-100/50 text-indigo-650 flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
                    <i className="fa-solid fa-chart-line text-xs" />
                  </div>
                </div>
                <p className="text-2xl font-black text-slate-900 tracking-tight mt-3 leading-none font-display text-left">
                  ₹{stats.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <div className="flex items-center gap-1.5 mt-3">
                  <span className="text-[9px] font-bold bg-emerald-50 text-emerald-700 px-1 py-0.5 rounded border border-emerald-100">↑ 23.5%</span>
                  <span className="text-[10px] text-slate-400 font-medium">vs last month</span>
                </div>
              </div>
              
              {/* Sparkline wave */}
              <div className="h-10 w-full mt-4 -mb-2 overflow-hidden rounded-b-xl opacity-80 group-hover:opacity-100 transition-opacity">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueSparklineData} margin={{ top: 0, bottom: 0, left: 0, right: 0 }}>
                    <defs>
                      <linearGradient id="sparklineRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#8b5cf6" 
                      strokeWidth={1.5} 
                      fillOpacity={1} 
                      fill="url(#sparklineRevenue)" 
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Total Orders Card with Sparkline */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 saas-shadow hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)] transition-all duration-200 flex flex-col justify-between h-full group">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-display">Total Orders</span>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100/50 text-blue-650 flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
                    <i className="fa-solid fa-arrow-down-wide-short text-xs" />
                  </div>
                </div>
                <p className="text-2xl font-black text-slate-900 tracking-tight mt-3 leading-none font-display text-left">
                  {stats.orders.toLocaleString()}
                </p>
                <div className="flex items-center gap-1.5 mt-3">
                  <span className="text-[9px] font-bold bg-emerald-50 text-emerald-700 px-1 py-0.5 rounded border border-emerald-100">↑ 15.2%</span>
                  <span className="text-[10px] text-slate-400 font-medium">vs last month</span>
                </div>
              </div>
              
              {/* Sparkline wave */}
              <div className="h-10 w-full mt-4 -mb-2 overflow-hidden rounded-b-xl opacity-80 group-hover:opacity-100 transition-opacity">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={ordersSparklineData} margin={{ top: 0, bottom: 0, left: 0, right: 0 }}>
                    <defs>
                      <linearGradient id="sparklineOrders" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#3b82f6" 
                      strokeWidth={1.5} 
                      fillOpacity={1} 
                      fill="url(#sparklineOrders)" 
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Combined Platform Telemetry Card (3 vertical boxes) */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 saas-shadow hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)] transition-all duration-200 flex flex-col justify-between h-full">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 font-display text-left">Platform Telemetry</p>
              <div className="space-y-2 flex-1 flex flex-col justify-center">
                {/* Item 1: Active Products */}
                <div 
                  onClick={() => navigate('/admin/products')}
                  className="flex items-center justify-between p-2 bg-amber-50/20 border border-amber-100/50 rounded-xl hover:bg-amber-50/50 hover:border-amber-250 hover:translate-x-1 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 transition-transform duration-200 group-hover:scale-105">
                      <i className="fa-solid fa-boxes-stacked text-[11px]" />
                    </div>
                    <div className="text-left">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none">Products</p>
                      <p className="text-xs font-bold text-slate-900 mt-1 leading-none">{stats.products.toLocaleString()}</p>
                    </div>
                  </div>
                  <span className="text-[8px] font-bold bg-emerald-50 text-emerald-700 px-1 py-0.5 rounded border border-emerald-150 leading-none">↑ 3.1%</span>
                </div>
                
                {/* Item 2: Registered Users */}
                <div 
                  onClick={() => navigate('/admin/users')}
                  className="flex items-center justify-between p-2 bg-emerald-50/20 border border-emerald-100/50 rounded-xl hover:bg-emerald-50/50 hover:border-emerald-250 hover:translate-x-1 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 transition-transform duration-200 group-hover:scale-105">
                      <i className="fa-solid fa-users text-[11px]" />
                    </div>
                    <div className="text-left">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none">Users</p>
                      <p className="text-xs font-bold text-slate-900 mt-1 leading-none">{stats.users.toLocaleString()}</p>
                    </div>
                  </div>
                  <span className="text-[8px] font-bold bg-emerald-50 text-emerald-700 px-1 py-0.5 rounded border border-emerald-150 leading-none">↑ 8.7%</span>
                </div>

                {/* Item 3: Fulfillment Rate */}
                <div 
                  onClick={() => navigate('/admin/orders')}
                  className="flex items-center justify-between p-2 bg-indigo-50/20 border border-indigo-100/50 rounded-xl hover:bg-indigo-50/50 hover:border-indigo-255 hover:translate-x-1 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-650 transition-transform duration-200 group-hover:scale-105">
                      <i className="fa-solid fa-circle-check text-[11px]" />
                    </div>
                    <div className="text-left">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none">Fulfillment</p>
                      <p className="text-xs font-bold text-slate-900 mt-1 leading-none text-left">
                        {stats.orders ? Math.round(((stats.paidOrders + stats.codOrders) / stats.orders) * 100) : 100}%
                      </p>
                    </div>
                  </div>
                  <span className="text-[8px] font-bold bg-indigo-50 text-indigo-750 px-1 py-0.5 rounded border border-indigo-150 leading-none">Rate</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (Fulfillment & Status Doughnut - Enlarged circle inside box) */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 saas-shadow hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)] transition-all duration-200 h-full flex flex-col justify-between">
              <div className="flex justify-between items-center pb-2">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-display">Fulfillment Breakdown</h3>
                <span className="text-[9px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold">Real-time</span>
              </div>
              
              <div className="flex items-center justify-between gap-3 py-1 flex-1">
                {/* Circular chart on the left (Enlarged) */}
                <div className="w-[50%] relative h-36 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={paymentBreakdownData}
                        cx="50%"
                        cy="50%"
                        innerRadius={34}
                        outerRadius={46}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {paymentBreakdownData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: any) => [value, 'Orders']}
                        contentStyle={{
                          backgroundColor: '#fff',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                          fontSize: '10px',
                          padding: '4px 8px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center absolute text badge */}
                  <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                    <p className="text-lg font-black text-slate-900 leading-none">{stats.orders || 0}</p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Total</p>
                  </div>
                </div>

                {/* List on the right side */}
                <div className="w-[50%] space-y-2.5 text-left">
                  {paymentBreakdownData.map((item, index) => {
                    const percentage = stats.orders ? ((item.value / stats.orders) * 100).toFixed(0) : '0';
                    return (
                      <div key={index} className="flex flex-col">
                        <div className="flex items-center justify-between text-[11px] leading-none">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                            <span className="font-semibold text-slate-700 truncate">{item.name}</span>
                          </div>
                          <span className="font-extrabold text-slate-900 ml-1">{item.value}</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1 rounded-full mt-1.5 overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${percentage}%`, backgroundColor: item.color }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Direct Colorful Payment & Fulfillment Analytics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-indigo-50/70 border border-indigo-200/80 p-4 rounded-2xl shadow-xs text-left hover:shadow-md transition-all">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-800 block">Online Payments</span>
            <div className="flex items-baseline justify-between mt-1.5">
              <span className="text-2xl font-extrabold text-indigo-600 font-display">{stats.totalOnlinePayments}</span>
              <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200">Razorpay</span>
            </div>
            <span className="text-[10px] font-medium text-indigo-500 mt-1 block">UPI & Card Transactions</span>
          </div>

          <div className="bg-blue-50/70 border border-blue-200/80 p-4 rounded-2xl shadow-xs text-left hover:shadow-md transition-all">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800 block">COD Orders</span>
            <div className="flex items-baseline justify-between mt-1.5">
              <span className="text-2xl font-extrabold text-blue-600 font-display">{stats.codOrders}</span>
              <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded border border-blue-200">Doorstep</span>
            </div>
            <span className="text-[10px] font-medium text-blue-500 mt-1 block">Cash on Delivery</span>
          </div>

          <div className="bg-emerald-50/70 border border-emerald-200/80 p-4 rounded-2xl shadow-xs text-left hover:shadow-md transition-all">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block">Paid Orders</span>
            <div className="flex items-baseline justify-between mt-1.5">
              <span className="text-2xl font-extrabold text-emerald-600 font-display">{stats.paidOrders}</span>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">Verified</span>
            </div>
            <span className="text-[10px] font-medium text-emerald-500 mt-1 block">Successful Payments</span>
          </div>

          <div className="bg-rose-50/70 border border-rose-200/80 p-4 rounded-2xl shadow-xs text-left hover:shadow-md transition-all">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800 block">Failed Payments</span>
            <div className="flex items-baseline justify-between mt-1.5">
              <span className="text-2xl font-extrabold text-rose-600 font-display">{stats.failedPayments}</span>
              <span className="text-[10px] font-bold bg-rose-100 text-rose-700 px-2 py-0.5 rounded border border-rose-200">Declined</span>
            </div>
            <span className="text-[10px] font-medium text-rose-500 mt-1 block">Verification Failed</span>
          </div>

          <div className="bg-amber-50/70 border border-amber-200/80 p-4 rounded-2xl shadow-xs text-left hover:shadow-md transition-all col-span-2 sm:col-span-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 block">Refunded Orders</span>
            <div className="flex items-baseline justify-between mt-1.5">
              <span className="text-2xl font-extrabold text-amber-600 font-display">{stats.refundedOrders}</span>
              <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded border border-amber-200">Refunds</span>
            </div>
            <span className="text-[10px] font-medium text-amber-500 mt-1 block">Processed Refunds</span>
          </div>
        </div>

        {/* Revenue Overview AreaChart & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card title="Revenue Overview" className="lg:col-span-2">
            <div className="h-72 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
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
                    formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, 'Revenue']}
                    contentStyle={{
                      backgroundColor: '#fff',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                    activeDot={{ r: 6, strokeWidth: 0, fill: '#6366f1' }}
                    dot={{ r: 4, strokeWidth: 1.5, stroke: '#6366f1', fill: '#fff' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            {/* Custom KPI indicators below the chart */}
            <div className="border-t border-slate-100 mt-5 pt-4 grid grid-cols-3 gap-4 text-left">
              <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-3.5 hover:bg-indigo-50 transition-colors duration-200">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-extrabold text-indigo-650 uppercase tracking-wider">Avg Order Value</span>
                  <ShoppingCart size={13} className="text-indigo-400" />
                </div>
                <p className="text-base font-extrabold text-indigo-950 mt-1.5">₹{(stats.revenue / (stats.orders || 1)).toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                <p className="text-[9px] text-indigo-400 font-medium font-sans mt-0.5">Mean ticket size</p>
              </div>
              <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-3.5 hover:bg-emerald-50 transition-colors duration-200">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-extrabold text-emerald-650 uppercase tracking-wider">Fulfillment Rate</span>
                  <CheckCircle size={13} className="text-emerald-400" />
                </div>
                <p className="text-base font-extrabold text-emerald-950 mt-1.5">{stats.orders ? Math.round(((stats.paidOrders + stats.codOrders) / stats.orders) * 100) : 100}%</p>
                <p className="text-[9px] text-emerald-400 font-medium font-sans mt-0.5">Completed vs Placed</p>
              </div>
              <div className="bg-purple-50/50 border border-purple-100 rounded-2xl p-3.5 hover:bg-purple-50 transition-colors duration-200">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-extrabold text-purple-650 uppercase tracking-wider">Conversion Ratio</span>
                  <TrendingUp size={13} className="text-purple-400" />
                </div>
                <p className="text-base font-extrabold text-purple-950 mt-1.5">{(stats.users ? ((stats.orders / stats.users) * 100).toFixed(1) : '5.2')}%</p>
                <p className="text-[9px] text-purple-400 font-medium font-sans mt-0.5">Orders per user</p>
              </div>
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

            <Card title="Payment & Channel Analysis">
              <div className="h-48 pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={paymentBreakdownBarData} barGap={4} margin={{ left: -10, right: -10, top: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="barOnlineRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.85} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.2} />
                      </linearGradient>
                      <linearGradient id="barCodRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.85} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.2} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 9 }} 
                    />
                    <YAxis 
                      yAxisId="left"
                      orientation="left"
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 9 }} 
                      tickFormatter={(val: any) => `₹${Number(val).toLocaleString()}`}
                    />
                    <YAxis 
                      yAxisId="right"
                      orientation="right"
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 9 }} 
                    />
                    <Tooltip
                      formatter={(value: any, name: any) => [
                        name === 'Revenue' ? `₹${Number(value).toLocaleString()}` : `${value} orders`,
                        name
                      ]}
                      contentStyle={{
                        backgroundColor: '#fff',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                        fontSize: '11px'
                      }}
                    />
                    <Bar yAxisId="left" dataKey="Revenue" fill="url(#barOnlineRev)" radius={[4, 4, 0, 0]} barSize={20} />
                    <Bar yAxisId="right" dataKey="Orders" fill="url(#barCodRev)" radius={[4, 4, 0, 0]} barSize={20} />
                    <Legend 
                      iconType="circle"
                      layout="horizontal"
                      verticalAlign="bottom"
                      align="center"
                      wrapperStyle={{ fontSize: '9px', paddingTop: '10px' }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card title="Recent Orders" className="lg:col-span-2">
            <DataTable
              columns={orderColumns}
              data={recentOrders}
              onRowClick={(item: any) => navigate(`/admin/orders/${item._id}`)}
            />
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
              <div
                key={product._id || index}
                onClick={() => navigate(`/admin/products/${product._id}`)}
                className="flex items-center justify-between p-3.5 bg-slate-50/60 border border-slate-100 rounded-xl hover:bg-slate-100 hover:border-slate-200 transition-all cursor-pointer shadow-3xs hover:scale-[1.01]"
              >
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
