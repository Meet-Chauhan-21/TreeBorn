import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { User as UserIcon, ShoppingBag, MapPin, LogOut, Download, Mail, Phone, Plus, Trash2, Edit, CheckCircle, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../context/AuthContext';
import type { Address, Order } from '../context/AuthContext';
import { SearchableDropdown } from '../components/layout/SearchableDropdown';
import { locationData } from '../data/locationData';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Container from '../components/layout/Container';
import WhatsAppButton from '../components/layout/WhatsAppButton';

// Validation Schemas
const profileSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .required('Full Name is required'),
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email address is required'),
  phone: Yup.string()
    .min(10, 'Contact Phone must be at least 10 digits')
    .required('Contact Phone is required'),
});

const addressSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .required('Recipient Name is required'),
  phone: Yup.string()
    .min(10, 'Phone must be at least 10 digits')
    .required('Recipient Contact Phone is required'),
  street: Yup.string()
    .min(5, 'Street address is too short')
    .required('Street Address is required'),
  country: Yup.string()
    .required('Country is required'),
  state: Yup.string()
    .required('State is required'),
  district: Yup.string()
    .required('District is required'),
  zip: Yup.string()
    .matches(/^[0-9]{6}$/, 'ZIP code must be exactly 6 digits')
    .required('ZIP / Postal Code is required'),
  isDefault: Yup.boolean(),
});

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading, logout, updateUser, addAddress, updateAddress, deleteAddress, fetchOrders } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'addresses'>('profile');
  
  // Orders State
  const [orderPage, setOrderPage] = useState(1);
  const ordersPerPage = 3;
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersTotal, setOrdersTotal] = useState(0);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Address edit state
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  // Dynamic initials calculation (no avatar field)
  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
    : 'U';

  // Protect route & synchronize profile formik state
  useEffect(() => {
    if (!loading && !user) {
      toast.error('Please sign in to access your profile panel.');
      navigate('/login');
    }
  }, [user, loading, navigate]);

  // Formik for Profile Info
  const profileFormik = useFormik({
    initialValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    },
    enableReinitialize: true,
    validationSchema: profileSchema,
    onSubmit: async (values) => {
      const success = await updateUser({
        name: values.name,
        email: values.email,
        phone: values.phone,
      });

      if (success) {
        toast.success('Profile settings updated successfully!');
      }
    },
  });

  // Formik for Address
  const addressFormik = useFormik({
    initialValues: {
      name: '',
      phone: '',
      street: '',
      country: 'India',
      state: '',
      district: '',
      zip: '',
      isDefault: false,
    },
    validationSchema: addressSchema,
    onSubmit: async (values) => {
      let success = false;
      const payload = {
        name: values.name,
        phone: values.phone,
        street: values.street,
        country: values.country,
        state: values.state,
        district: values.district,
        zip: values.zip,
        isDefault: values.isDefault,
      };

      if (editingAddressId) {
        success = await updateAddress(editingAddressId, payload);
      } else {
        success = await addAddress(payload);
      }

      if (success) {
        setIsEditingAddress(false);
        setEditingAddressId(null);
        addressFormik.resetForm();
        toast.success(editingAddressId ? 'Address updated!' : 'Address added!');
      }
    },
  });

  // Fetch real orders when the user opens "Order History"
  useEffect(() => {
    if (activeTab !== 'orders' || !user) return;

    let cancelled = false;

    const run = async () => {
      setOrdersLoading(true);
      const data = await fetchOrders(orderPage, ordersPerPage);
      if (cancelled) return;

      if (!data) {
        setOrders([]);
        setOrdersTotal(0);
        setOrdersLoading(false);
        return;
      }

      setOrders(data.orders);
      setOrdersTotal(data.total);
      setOrdersLoading(false);
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [activeTab, orderPage, ordersPerPage, user, fetchOrders]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-light-gray flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const totalPages = ordersTotal > 0 ? Math.ceil(ordersTotal / ordersPerPage) : 0;

  const formatOrderDate = (isoDate?: string) => {
    if (!isoDate) return '';
    return new Date(isoDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: '2-digit' });
  };

  // Address Dropdown Select Cascades
  const countryOptions = locationData.map((c) => c.name);
  const selectedCountryObj = locationData.find((c) => c.name === addressFormik.values.country);
  const stateOptions = selectedCountryObj ? selectedCountryObj.states.map((s) => s.name) : [];
  const selectedStateObj = selectedCountryObj?.states.find((s) => s.name === addressFormik.values.state);
  const districtOptions = selectedStateObj ? selectedStateObj.districts : [];

  const handleCountryChange = (val: string) => {
    addressFormik.setFieldValue('country', val);
    addressFormik.setFieldValue('state', '');
    addressFormik.setFieldValue('district', '');
  };

  const handleStateChange = (val: string) => {
    addressFormik.setFieldValue('state', val);
    addressFormik.setFieldValue('district', '');
  };

  const handleDistrictChange = (val: string) => {
    addressFormik.setFieldValue('district', val);
  };

  const handleEditAddress = (addr: Address) => {
    if (!addr._id) return;
    setEditingAddressId(addr._id);
    addressFormik.setValues({
      name: addr.name,
      phone: addr.phone,
      street: addr.street,
      country: addr.country,
      state: addr.state,
      district: addr.district,
      zip: addr.zip,
      isDefault: addr.isDefault || false,
    });
    setIsEditingAddress(true);
  };

  const handleDeleteAddress = async (addrId: string | undefined) => {
    if (!addrId) return;
    if (window.confirm('Are you sure you want to delete this address?')) {
      const success = await deleteAddress(addrId);
      if (success) {
        toast.success('Address deleted successfully.');
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>My Profile — TREEBORN Skincare</title>
        <meta name="description" content="Manage your TREEBORN account details, shipping addresses, and review order history." />
      </Helmet>

      <Navbar />

      <main className="pt-24 pb-20 min-h-screen bg-light-gray/30">
        {/* Luxury Premium Header Profile Card Banner */}
        <div className="bg-gradient-to-r from-primary-dark via-primary to-coffee-dark py-14 text-white border-b border-white/10 shadow-lg relative overflow-hidden rounded-b-[2.5rem]">
          {/* Ambient glow backdrops */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-light/25 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-light-blue/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

          <Container className="relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5 flex-col md:flex-row text-center md:text-left">
                {/* Dynamically generated initials bubble */}
                <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-primary-light to-primary border-2 border-light-blue-dark/50 flex items-center justify-center text-white font-display font-bold text-2xl sm:text-3xl shadow-xl backdrop-blur-md flex-shrink-0 relative">
                  {initials}
                  <span className="absolute bottom-0 right-0 w-5.5 h-5.5 bg-secondary border-2 border-primary-dark rounded-full flex items-center justify-center shadow-xs" title="Premium Tree Born Circle Member">
                    <CheckCircle size={11} className="text-white" />
                  </span>
                </div>
                <div className="space-y-1">
                  <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-white flex items-center justify-center md:justify-start gap-2">
                    <span>{user.name}</span>
                    {user.role === 'admin' && (
                      <span className="bg-secondary/20 text-[#22C55E] border border-secondary/30 px-2 py-0.5 rounded-full text-[9px] font-sans font-bold uppercase tracking-wider">
                        Admin
                      </span>
                    )}
                  </h1>
                  <p className="text-xs text-white/80 font-sans tracking-wide">
                    {user.email} &bull; Tree Born Circle Member
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleLogout}
                  className="bg-transparent border border-white/20 hover:border-white hover:bg-white/10 text-white text-xs font-semibold px-5 py-2.5 rounded-full tracking-wider uppercase transition-all duration-200 cursor-pointer flex items-center gap-1.5 focus:outline-none"
                >
                  <LogOut size={13} />
                  <span>Log Out</span>
                </button>
                {user.role === 'admin' && (
                  <button
                    onClick={() => navigate('/admin')}
                    className="bg-secondary hover:bg-secondary/90 text-white text-xs font-bold px-5 py-2.5 rounded-full tracking-wider uppercase transition-all duration-200 cursor-pointer flex items-center gap-1.5 focus:outline-none shadow-sm"
                  >
                    <Shield size={13} />
                    <span>Admin Panel</span>
                  </button>
                )}
              </div>
            </div>
          </Container>
        </div>

        {/* Workspace content grid */}
        <Container className="mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Sidebar Navigation */}
            <div className="lg:col-span-3 bg-white rounded-3xl border border-border-gray/30 p-5 shadow-sm space-y-4">
              <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-primary/50 block px-2">
                My Dashboard
              </span>
              <nav className="flex flex-col gap-1 text-xs font-display font-semibold uppercase tracking-wider text-dark/70">
                <button
                  onClick={() => { setActiveTab('profile'); setIsEditingAddress(false); }}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-left cursor-pointer transition-all ${
                    activeTab === 'profile'
                      ? 'bg-primary/5 text-primary border-l-3 border-primary pl-3'
                      : 'hover:bg-light-gray/40'
                  }`}
                >
                  <UserIcon size={14} className={activeTab === 'profile' ? 'text-primary' : 'text-gray-400'} />
                  <span>Profile Settings</span>
                </button>

                <button
                  onClick={() => { setActiveTab('orders'); setIsEditingAddress(false); setOrderPage(1); }}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-left cursor-pointer transition-all ${
                    activeTab === 'orders'
                      ? 'bg-primary/5 text-primary border-l-3 border-primary pl-3'
                      : 'hover:bg-light-gray/40'
                  }`}
                >
                  <ShoppingBag size={14} className={activeTab === 'orders' ? 'text-primary' : 'text-gray-400'} />
                  <span>Order History</span>
                </button>

                <button
                  onClick={() => { setActiveTab('addresses'); }}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-left cursor-pointer transition-all ${
                    activeTab === 'addresses'
                      ? 'bg-primary/5 text-primary border-l-3 border-primary pl-3'
                      : 'hover:bg-light-gray/40'
                  }`}
                >
                  <MapPin size={14} className={activeTab === 'addresses' ? 'text-primary' : 'text-gray-400'} />
                  <span>Saved Addresses</span>
                </button>
              </nav>
            </div>

            {/* Main Panel Content */}
            <div className="lg:col-span-9 bg-white rounded-3xl border border-border-gray/30 p-6 sm:p-8 shadow-sm min-h-[480px]">
              
              {/* Tab 1: Profile Details */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div className="border-b border-border-gray/40 pb-4">
                    <h2 className="text-lg font-display font-semibold text-dark">Profile Settings</h2>
                    <p className="text-xs text-gray-500 mt-1 font-sans">
                      Keep your core account metrics updated to ensure swift delivery notifications and custom formulations.
                    </p>
                  </div>

                  <form onSubmit={profileFormik.handleSubmit} className="space-y-5 max-w-2xl">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {/* Name */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-dark/70 font-display flex items-center gap-1.5">
                          <UserIcon size={12} className="text-gray-400" />
                          <span>Full Name</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={profileFormik.values.name}
                          onChange={profileFormik.handleChange}
                          onBlur={profileFormik.handleBlur}
                          className={`w-full border px-4 py-3 text-sm rounded-xl text-dark focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 font-sans bg-light-gray/10 transition-colors ${
                            profileFormik.touched.name && profileFormik.errors.name
                              ? 'border-red-500 focus:border-red-550'
                              : 'border-border-gray/80'
                          }`}
                        />
                        {profileFormik.touched.name && profileFormik.errors.name && (
                          <div className="text-[10px] text-red-500 font-sans font-medium mt-1">
                            {profileFormik.errors.name}
                          </div>
                        )}
                      </div>
                      
                      {/* Phone */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-dark/70 font-display flex items-center gap-1.5">
                          <Phone size={12} className="text-gray-400" />
                          <span>Contact Phone</span>
                        </label>
                        <input
                          type="text"
                          name="phone"
                          value={profileFormik.values.phone}
                          onChange={profileFormik.handleChange}
                          onBlur={profileFormik.handleBlur}
                          className={`w-full border px-4 py-3 text-sm rounded-xl text-dark focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 font-sans bg-light-gray/10 transition-colors ${
                            profileFormik.touched.phone && profileFormik.errors.phone
                              ? 'border-red-500 focus:border-red-500'
                              : 'border-border-gray/80'
                          }`}
                        />
                        {profileFormik.touched.phone && profileFormik.errors.phone && (
                          <div className="text-[10px] text-red-500 font-sans font-medium mt-1">
                            {profileFormik.errors.phone}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5 max-w-sm">
                      <label className="text-xs font-semibold text-dark/70 font-display flex items-center gap-1.5">
                        <Mail size={12} className="text-gray-400" />
                        <span>Email Address</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={profileFormik.values.email}
                        onChange={profileFormik.handleChange}
                        onBlur={profileFormik.handleBlur}
                        className={`w-full border px-4 py-3 text-sm rounded-xl text-dark focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 font-sans bg-light-gray/10 transition-colors ${
                          profileFormik.touched.email && profileFormik.errors.email
                            ? 'border-red-500 focus:border-red-500'
                            : 'border-border-gray/80'
                        }`}
                      />
                      {profileFormik.touched.email && profileFormik.errors.email && (
                        <div className="text-[10px] text-red-500 font-sans font-medium mt-1">
                          {profileFormik.errors.email}
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-primary/10 mt-6">
                      <button
                        type="submit"
                        disabled={profileFormik.isSubmitting}
                        className="bg-primary hover:bg-primary-light text-white text-xs font-bold px-6 py-3.5 rounded-full tracking-wider uppercase shadow-xs hover:shadow-md transition-all active:scale-[0.98] cursor-pointer w-full sm:w-auto focus:outline-none"
                      >
                        {profileFormik.isSubmitting ? 'Saving...' : 'Save Settings'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Tab 2: Orders */}
              {activeTab === 'orders' && (
                <div className="space-y-6">
                  <div className="border-b border-border-gray/40 pb-4">
                    <h2 className="text-lg font-display font-semibold text-dark">Order History</h2>
                    <p className="text-xs text-gray-500 mt-1 font-sans">
                      {ordersLoading
                        ? 'Loading your order history...'
                        : `Track active deliveries and review previous botanical purchases. Showing ${orders.length} of ${ordersTotal} orders.`}
                    </p>
                  </div>

                  <div className="space-y-5">
                    {ordersLoading ? (
                      <div className="py-12 flex items-center justify-center">
                        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                      </div>
                    ) : orders.length === 0 ? (
                      <div className="py-12 text-center space-y-2">
                        <ShoppingBag size={22} className="text-gray-300 mx-auto" />
                        <h4 className="font-display font-semibold text-sm text-dark">No orders yet</h4>
                        <p className="text-xs text-gray-500 font-sans">Place your first order to see it here.</p>
                      </div>
                    ) : (
                      orders.map((order) => (
                        <div
                          key={order.orderNumber}
                          className="border border-border-gray/40 rounded-2xl overflow-hidden shadow-xs hover:border-primary/10 transition-all hover:shadow-sm"
                        >
                          {/* Order Header bar */}
                          <div className="bg-light-blue/15 border-b border-border-gray/30 p-4 sm:px-5 flex flex-wrap justify-between items-center gap-3">
                            <div className="flex gap-4 sm:gap-6 text-xs text-gray-500 font-sans">
                              <div>
                                <span className="block font-medium">Order Placed</span>
                                <span className="font-semibold text-dark mt-0.5 block">{formatOrderDate(order.createdAt)}</span>
                              </div>
                              <div>
                                <span className="block font-medium">Order ID</span>
                                <span className="font-semibold text-dark mt-0.5 block">{order.orderNumber}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-sans font-bold uppercase tracking-wider ${
                                order.status === 'delivered'
                                  ? 'bg-secondary/15 text-secondary'
                                  : 'bg-primary/10 text-primary'
                              }`}>
                                {order.status}
                              </span>
                              <button
                                onClick={() => toast.success('Invoice download started.')}
                                className="text-gray-400 hover:text-primary transition-colors flex items-center gap-1 text-xs cursor-pointer focus:outline-none"
                                aria-label="Download Invoice"
                              >
                                <Download size={13} />
                                <span className="hidden sm:inline">Invoice</span>
                              </button>
                            </div>
                          </div>

                          {/* Order Items list */}
                          <div className="p-4 sm:px-5 divide-y divide-border-gray/30">
                            {order.items.map((item, idx) => (
                              <div
                                key={`${item.productId}-${idx}`}
                                className="py-3.5 first:pt-0 last:pb-0 flex justify-between items-center text-xs sm:text-sm font-sans"
                              >
                                <div>
                                  <h4 className="font-semibold text-dark leading-tight">{item.name}</h4>
                                  <span className="text-[10px] text-gray-400 mt-0.5 block">Quantity: {item.quantity}</span>
                                </div>
                                <span className="font-display font-bold text-primary">₹{item.price.toFixed(2)}</span>
                              </div>
                            ))}
                          </div>

                          {/* Order total footer */}
                          <div className="bg-light-gray/5 border-t border-border-gray/30 p-4 sm:px-5 flex justify-between items-center text-xs sm:text-sm font-display">
                            <span className="font-semibold text-gray-500">Total Paid</span>
                            <span className="font-bold text-primary text-base">₹{order.totals.total.toFixed(2)}</span>
                          </div>
                        </div>
                      ))
                    )}

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="flex justify-between items-center pt-4 border-t border-border-gray/30 font-display text-xs font-semibold text-dark/70">
                        <button
                          disabled={orderPage === 1}
                          onClick={() => setOrderPage(orderPage - 1)}
                          className={`px-4 py-2 border border-border-gray/50 rounded-xl cursor-pointer transition-colors ${
                            orderPage === 1
                              ? 'opacity-40 cursor-not-allowed bg-gray-55'
                              : 'hover:bg-light-gray/30'
                          }`}
                        >
                          Previous
                        </button>
                        <span>
                          Page {orderPage} of {totalPages}
                        </span>
                        <button
                          disabled={orderPage === totalPages}
                          onClick={() => setOrderPage(orderPage + 1)}
                          className={`px-4 py-2 border border-border-gray/50 rounded-xl cursor-pointer transition-colors ${
                            orderPage === totalPages
                              ? 'opacity-40 cursor-not-allowed bg-gray-55'
                              : 'hover:bg-light-gray/30'
                          }`}
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 3: Addresses */}
              {activeTab === 'addresses' && (
                <div className="space-y-6">
                  <div className="border-b border-border-gray/40 pb-4 flex justify-between items-center gap-4">
                    <div>
                      <h2 className="text-lg font-display font-semibold text-dark">Saved Addresses</h2>
                      <p className="text-xs text-gray-500 mt-1 font-sans">
                        Add or modify your shipping locations to speed up standard checkouts.
                      </p>
                    </div>
                    {!isEditingAddress && (
                      <button
                        onClick={() => {
                          setEditingAddressId(null);
                          addressFormik.resetForm();
                          setIsEditingAddress(true);
                        }}
                        className="bg-primary hover:bg-primary-light text-white text-xs font-semibold px-4 py-2.5 rounded-full flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors focus:outline-none"
                      >
                        <Plus size={14} />
                        <span>Add Address</span>
                      </button>
                    )}
                  </div>

                  {/* Add / Edit Address Form using Formik & Yup validations */}
                  {isEditingAddress ? (
                    <form onSubmit={addressFormik.handleSubmit} className="bg-light-gray/15 border border-border-gray/40 rounded-3xl p-5 sm:p-6 space-y-4">
                      <h3 className="font-display font-bold text-sm text-primary border-b border-border-gray/30 pb-2">
                        {editingAddressId ? 'Edit Address Detail' : 'Register New Address'}
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Recipient Name */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-dark/70 font-display">Recipient Name *</label>
                          <input
                            type="text"
                            name="name"
                            placeholder="Priyesh Patel"
                            value={addressFormik.values.name}
                            onChange={addressFormik.handleChange}
                            onBlur={addressFormik.handleBlur}
                            className={`w-full border px-4 py-2.5 text-xs rounded-xl text-dark focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 font-sans bg-white transition-colors ${
                              addressFormik.touched.name && addressFormik.errors.name
                                ? 'border-red-500 focus:border-red-500'
                                : 'border-border-gray/80'
                            }`}
                          />
                          {addressFormik.touched.name && addressFormik.errors.name && (
                            <div className="text-[9px] text-red-500 font-sans font-medium mt-0.5">
                              {addressFormik.errors.name}
                            </div>
                          )}
                        </div>

                        {/* Recipient Contact Phone */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-dark/70 font-display">Recipient Contact Phone *</label>
                          <input
                            type="text"
                            name="phone"
                            placeholder="+91 98765 43210"
                            value={addressFormik.values.phone}
                            onChange={addressFormik.handleChange}
                            onBlur={addressFormik.handleBlur}
                            className={`w-full border px-4 py-2.5 text-xs rounded-xl text-dark focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 font-sans bg-white transition-colors ${
                              addressFormik.touched.phone && addressFormik.errors.phone
                                ? 'border-red-500 focus:border-red-500'
                                : 'border-border-gray/80'
                            }`}
                          />
                          {addressFormik.touched.phone && addressFormik.errors.phone && (
                            <div className="text-[9px] text-red-500 font-sans font-medium mt-0.5">
                              {addressFormik.errors.phone}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Street Address */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-dark/70 font-display">Street Address (House No, Building, Area) *</label>
                        <input
                          type="text"
                          name="street"
                          placeholder="404 Luxury Tower, SG Highway"
                          value={addressFormik.values.street}
                          onChange={addressFormik.handleChange}
                          onBlur={addressFormik.handleBlur}
                          className={`w-full border px-4 py-2.5 text-xs rounded-xl text-dark focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 font-sans bg-white transition-colors ${
                            addressFormik.touched.street && addressFormik.errors.street
                              ? 'border-red-500 focus:border-red-500'
                              : 'border-border-gray/80'
                          }`}
                        />
                        {addressFormik.touched.street && addressFormik.errors.street && (
                          <div className="text-[9px] text-red-500 font-sans font-medium mt-0.5">
                            {addressFormik.errors.street}
                          </div>
                        )}
                      </div>

                      {/* Dynamic Cascading Dropdowns matching Government Sites */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <SearchableDropdown
                          label="Country"
                          required
                          options={countryOptions}
                          value={addressFormik.values.country}
                          onChange={handleCountryChange}
                        />

                        <SearchableDropdown
                          label="State"
                          required
                          options={stateOptions}
                          value={addressFormik.values.state}
                          onChange={handleStateChange}
                          placeholder={addressFormik.values.country ? "Select State" : "Choose Country first"}
                          disabled={!addressFormik.values.country}
                        />

                        <SearchableDropdown
                          label="District"
                          required
                          options={districtOptions}
                          value={addressFormik.values.district}
                          onChange={handleDistrictChange}
                          placeholder={addressFormik.values.state ? "Select District" : "Choose State first"}
                          disabled={!addressFormik.values.state}
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {addressFormik.touched.country && addressFormik.errors.country && (
                          <div className="text-[9px] text-red-500 font-sans font-medium">{addressFormik.errors.country}</div>
                        )}
                        {addressFormik.touched.state && addressFormik.errors.state && (
                          <div className="text-[9px] text-red-500 font-sans font-medium">{addressFormik.errors.state}</div>
                        )}
                        {addressFormik.touched.district && addressFormik.errors.district && (
                          <div className="text-[9px] text-red-500 font-sans font-medium">{addressFormik.errors.district}</div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* ZIP */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-dark/70 font-display">ZIP / Postal Code *</label>
                          <input
                            type="text"
                            name="zip"
                            placeholder="380054"
                            value={addressFormik.values.zip}
                            onChange={addressFormik.handleChange}
                            onBlur={addressFormik.handleBlur}
                            className={`w-full border px-4 py-2.5 text-xs rounded-xl text-dark focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 font-sans bg-white transition-colors ${
                              addressFormik.touched.zip && addressFormik.errors.zip
                                ? 'border-red-500 focus:border-red-500'
                                : 'border-border-gray/80'
                            }`}
                          />
                          {addressFormik.touched.zip && addressFormik.errors.zip && (
                            <div className="text-[9px] text-red-500 font-sans font-medium mt-0.5">
                              {addressFormik.errors.zip}
                            </div>
                          )}
                        </div>

                        {/* Set as Default */}
                        <div className="flex items-center gap-2 pt-6 font-display text-xs font-semibold text-dark/80">
                          <input
                            type="checkbox"
                            id="isDefault"
                            name="isDefault"
                            checked={addressFormik.values.isDefault}
                            onChange={addressFormik.handleChange}
                            className="rounded border-border-gray text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                          />
                          <label htmlFor="isDefault" className="cursor-pointer">
                            Set as primary billing/shipping address
                          </label>
                        </div>
                      </div>

                      <div className="pt-4 flex gap-3 text-xs font-semibold">
                        <button
                          type="submit"
                          className="bg-primary hover:bg-primary-light text-white px-5 py-2.5 rounded-full cursor-pointer transition-colors focus:outline-none"
                        >
                          {editingAddressId ? 'Update Address' : 'Register Address'}
                        </button>
                        <button
                          type="button"
                          onClick={() => { setIsEditingAddress(false); setEditingAddressId(null); addressFormik.resetForm(); }}
                          className="bg-transparent border border-border-gray hover:bg-primary/5 hover:text-primary px-5 py-2.5 rounded-full cursor-pointer transition-colors focus:outline-none"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {user.addresses && user.addresses.length > 0 ? (
                        user.addresses.map((addr) => (
                          <div
                            key={addr._id}
                            className={`border rounded-2xl p-4 sm:p-5 relative space-y-3 transition-all hover:shadow-xs ${
                              addr.isDefault
                                ? 'border-primary bg-primary/2'
                                : 'border-border-gray/40'
                            }`}
                          >
                            {addr.isDefault && (
                              <span className="absolute top-4 right-4 bg-primary text-white px-2 py-0.5 rounded-full text-[8px] font-sans font-bold uppercase tracking-wider">
                                Primary
                              </span>
                            )}
                            
                            <div className="space-y-1 text-xs">
                              <h4 className="font-display font-bold text-dark">{addr.name}</h4>
                              <p className="text-gray-500 font-sans">{addr.phone}</p>
                              <p className="text-gray-600 font-sans mt-2 pr-10 leading-relaxed">
                                {addr.street}, {addr.district}, {addr.state}, {addr.country} - {addr.zip}
                              </p>
                            </div>

                            <div className="pt-3 border-t border-border-gray/30 flex gap-4 text-[10px] font-display font-bold uppercase tracking-wider">
                              <button
                                onClick={() => handleEditAddress(addr)}
                                className="text-primary hover:text-primary-light flex items-center gap-1 cursor-pointer transition-colors focus:outline-none"
                              >
                                <Edit size={12} />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => handleDeleteAddress(addr._id)}
                                className="text-red-500 hover:text-red-655 flex items-center gap-1 cursor-pointer transition-colors focus:outline-none"
                              >
                                <Trash2 size={12} />
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-2 py-12 text-center space-y-2 border border-dashed border-border-gray/40 rounded-3xl">
                          <MapPin size={22} className="text-gray-300 mx-auto" />
                          <h4 className="font-display font-semibold text-sm text-dark">No saved addresses</h4>
                          <p className="text-xs text-gray-500 font-sans">Register shipping destinations above to speed up checkout.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </Container>
      </main>

      <WhatsAppButton />
      <Footer />
    </>
  );
};

export default Profile;
