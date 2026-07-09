import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { User as UserIcon, ShoppingBag, MapPin, LogOut, Download, Mail, Phone, Plus, Trash2, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import type { Address } from '../context/AuthContext';
import { SearchableDropdown } from '../components/layout/SearchableDropdown';
import { locationData } from '../data/locationData';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Container from '../components/layout/Container';
import WhatsAppButton from '../components/layout/WhatsAppButton';

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading, logout, updateUser, addAddress, updateAddress, deleteAddress } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'addresses'>('profile');
  
  // Profile settings state
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    phone: '',
  });

  // Order pagination state
  const [orderPage, setOrderPage] = useState(1);
  const ordersPerPage = 3;

  // Address form management state
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState({
    name: '',
    phone: '',
    street: '',
    country: 'India',
    state: '',
    district: '',
    zip: '',
    isDefault: false
  });

  // Protect route & synchronize state
  useEffect(() => {
    if (!loading && !user) {
      toast.error('Please sign in to access your profile panel.');
      navigate('/login');
    } else if (user) {
      setUserInfo({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
      });
    }
  }, [user, loading, navigate]);

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInfo.name || !userInfo.email || !userInfo.phone) {
      toast.error('Name, email, and phone number are mandatory.');
      return;
    }

    const success = await updateUser({
      name: userInfo.name,
      email: userInfo.email,
      phone: userInfo.phone,
    });

    if (success) {
      toast.success('Profile settings updated successfully!');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-light-gray flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#0F3D2E]/20 border-t-[#0F3D2E] rounded-full animate-spin" />
      </div>
    );
  }

  // Expanded Mock Orders Dataset for Pagination Testing
  const mockOrders = [
    {
      id: 'TREEBORN-9801',
      date: 'July 08, 2026',
      status: 'Delivered',
      items: [
        { name: 'Restorative Peptide Serum', quantity: 1, price: 85.00 },
        { name: 'Gentle Hydrating Cleanser', quantity: 1, price: 36.00 },
      ],
      total: 121.00,
    },
    {
      id: 'TREEBORN-8564',
      date: 'July 05, 2026',
      status: 'Delivered',
      items: [
        { name: 'Barrier Renewal Cream', quantity: 1, price: 68.00 },
      ],
      total: 68.00,
    },
    {
      id: 'TREEBORN-7412',
      date: 'June 22, 2026',
      status: 'Delivered',
      items: [
        { name: 'Nourishing Face Oil', quantity: 2, price: 45.00 },
      ],
      total: 90.00,
    },
    {
      id: 'TREEBORN-6325',
      date: 'June 15, 2026',
      status: 'Delivered',
      items: [
        { name: 'Exfoliating Scrub', quantity: 1, price: 28.00 },
        { name: 'Rosewater Toner', quantity: 1, price: 22.00 },
      ],
      total: 50.00,
    },
    {
      id: 'TREEBORN-5214',
      date: 'May 18, 2026',
      status: 'Delivered',
      items: [
        { name: 'Hyaluronic Acid Ampoule', quantity: 1, price: 54.00 },
      ],
      total: 54.00,
    },
    {
      id: 'TREEBORN-4103',
      date: 'April 30, 2026',
      status: 'Delivered',
      items: [
        { name: 'Vitamin C Brightening Serum', quantity: 1, price: 72.00 },
      ],
      total: 72.00,
    },
    {
      id: 'TREEBORN-3092',
      date: 'March 12, 2026',
      status: 'Delivered',
      items: [
        { name: 'Clay Detox Mask', quantity: 2, price: 32.00 },
      ],
      total: 64.00,
    }
  ];

  // Paginated and sorted orders (already sorted chronologically in our list)
  const totalPages = Math.ceil(mockOrders.length / ordersPerPage);
  const paginatedOrders = mockOrders.slice(
    (orderPage - 1) * ordersPerPage,
    orderPage * ordersPerPage
  );

  // Address Dropdown Select Cascades
  const countryOptions = locationData.map((c) => c.name);
  
  const selectedCountryObj = locationData.find((c) => c.name === addressForm.country);
  const stateOptions = selectedCountryObj ? selectedCountryObj.states.map((s) => s.name) : [];
  
  const selectedStateObj = selectedCountryObj?.states.find((s) => s.name === addressForm.state);
  const districtOptions = selectedStateObj ? selectedStateObj.districts : [];

  // Cascading updates for address dropdowns
  const handleCountryChange = (val: string) => {
    setAddressForm({
      ...addressForm,
      country: val,
      state: '',
      district: ''
    });
  };

  const handleStateChange = (val: string) => {
    setAddressForm({
      ...addressForm,
      state: val,
      district: ''
    });
  };

  const handleDistrictChange = (val: string) => {
    setAddressForm({
      ...addressForm,
      district: val
    });
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, phone, street, country, state, district, zip, isDefault } = addressForm;
    
    if (!name || !phone || !street || !country || !state || !district || !zip) {
      toast.error('Please complete all required fields.');
      return;
    }

    let success = false;
    const payload = { name, phone, street, country, state, district, zip, isDefault };

    if (editingAddressId) {
      success = await updateAddress(editingAddressId, payload);
    } else {
      success = await addAddress(payload);
    }

    if (success) {
      setIsEditingAddress(false);
      setEditingAddressId(null);
      setAddressForm({
        name: '',
        phone: '',
        street: '',
        country: 'India',
        state: '',
        district: '',
        zip: '',
        isDefault: false
      });
    }
  };

  const handleEditAddress = (addr: Address) => {
    if (!addr._id) return;
    setEditingAddressId(addr._id);
    setAddressForm({
      name: addr.name,
      phone: addr.phone,
      street: addr.street,
      country: addr.country,
      state: addr.state,
      district: addr.district,
      zip: addr.zip,
      isDefault: addr.isDefault || false
    });
    setIsEditingAddress(true);
  };

  const handleDeleteAddress = async (addrId: string | undefined) => {
    if (!addrId) return;
    if (window.confirm('Are you sure you want to delete this address?')) {
      await deleteAddress(addrId);
    }
  };

  return (
    <>
      <Helmet>
        <title>My Profile — TREEBORN Skincare</title>
        <meta name="description" content="Manage your TREEBORN account details, shipping addresses, and review order history." />
      </Helmet>

      <Navbar />

      <main className="pt-28 pb-20 min-h-screen bg-light-gray/20">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Sidebar Navigation */}
            <div className="lg:col-span-3 bg-white rounded-3xl border border-border-gray/30 p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-3 pb-5 border-b border-border-gray/30">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-display font-bold text-lg">
                  {user.avatar || 'U'}
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm text-dark truncate max-w-[150px]">
                    {user.name}
                  </h3>
                  <span className="text-[10px] text-gray-400 font-sans block truncate max-w-[150px]">
                    {user.email}
                  </span>
                </div>
              </div>

              <nav className="flex flex-col gap-1 text-xs font-display font-semibold uppercase tracking-wider text-dark/70">
                <button
                  onClick={() => { setActiveTab('profile'); setIsEditingAddress(false); }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left cursor-pointer transition-colors ${
                    activeTab === 'profile'
                      ? 'bg-primary/5 text-primary'
                      : 'hover:bg-light-gray/40'
                  }`}
                >
                  <UserIcon size={14} />
                  <span>Profile Settings</span>
                </button>

                <button
                  onClick={() => { setActiveTab('orders'); setIsEditingAddress(false); }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left cursor-pointer transition-colors ${
                    activeTab === 'orders'
                      ? 'bg-primary/5 text-primary'
                      : 'hover:bg-light-gray/40'
                  }`}
                >
                  <ShoppingBag size={14} />
                  <span>Order History</span>
                </button>

                <button
                  onClick={() => { setActiveTab('addresses'); }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left cursor-pointer transition-colors ${
                    activeTab === 'addresses'
                      ? 'bg-primary/5 text-primary'
                      : 'hover:bg-light-gray/40'
                  }`}
                >
                  <MapPin size={14} />
                  <span>Saved Addresses</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="hidden lg:flex items-center gap-3 px-4 py-3 rounded-xl text-left text-red-500 hover:bg-red-50 cursor-pointer transition-colors"
                >
                  <LogOut size={14} />
                  <span>Log Out Account</span>
                </button>
              </nav>
            </div>

            {/* Main Panel Content */}
            <div className="lg:col-span-9 bg-white rounded-3xl border border-border-gray/30 p-6 sm:p-8 shadow-sm">
              
              {/* Tab 1: Profile Details */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div className="border-b border-border-gray/40 pb-4">
                    <h2 className="text-lg font-display font-semibold text-dark">Profile Settings</h2>
                    <p className="text-xs text-gray-500 mt-1 font-sans">
                      Keep your core account metrics updated to ensure swift delivery notifications.
                    </p>
                  </div>

                  <form onSubmit={handleSaveInfo} className="space-y-5 max-w-2xl">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-dark/70 font-display flex items-center gap-1">
                          <UserIcon size={12} className="opacity-60" />
                          <span>Full Name</span>
                        </label>
                        <input
                          type="text"
                          value={userInfo.name}
                          onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
                          className="w-full border border-border-gray/80 px-4 py-3 text-sm rounded-xl text-dark focus:outline-none focus:border-primary font-sans bg-light-gray/20 transition-colors"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-dark/70 font-display flex items-center gap-1">
                          <Phone size={12} className="opacity-60" />
                          <span>Contact Phone</span>
                        </label>
                        <input
                          type="text"
                          value={userInfo.phone}
                          onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })}
                          className="w-full border border-border-gray/80 px-4 py-3 text-sm rounded-xl text-dark focus:outline-none focus:border-primary font-sans bg-light-gray/20 transition-colors"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-dark/70 font-display flex items-center gap-1">
                        <Mail size={12} className="opacity-60" />
                        <span>Email Address</span>
                      </label>
                      <input
                        type="email"
                        value={userInfo.email}
                        onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                        className="w-full border border-border-gray/80 px-4 py-3 text-sm rounded-xl text-dark focus:outline-none focus:border-primary font-sans bg-light-gray/20 transition-colors"
                        required
                      />
                    </div>

                    <div className="pt-2 border-t border-border-gray/30 mt-6 flex justify-between items-center flex-wrap gap-4">
                      <button
                        type="submit"
                        className="bg-primary hover:bg-primary-light text-white text-xs font-semibold px-6 py-3 rounded-full tracking-wider uppercase shadow-sm cursor-pointer transition-colors w-full sm:w-auto"
                      >
                        Save Settings
                      </button>
                      
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="lg:hidden flex items-center gap-1 text-red-500 font-display font-bold text-xs uppercase tracking-wider p-2 cursor-pointer hover:underline"
                      >
                        <LogOut size={14} />
                        <span>Log Out Account</span>
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
                      Track active deliveries and review previous botanical purchases. Showing {paginatedOrders.length} of {mockOrders.length} orders.
                    </p>
                  </div>

                  <div className="space-y-5">
                    {paginatedOrders.map((order) => (
                      <div
                        key={order.id}
                        className="border border-border-gray/40 rounded-2xl overflow-hidden shadow-xs hover:border-primary/10 transition-colors"
                      >
                        {/* Order Header bar */}
                        <div className="bg-light-gray/35 border-b border-border-gray/30 p-4 sm:px-5 flex flex-wrap justify-between items-center gap-3">
                          <div className="flex gap-4 sm:gap-6 text-xs text-gray-500 font-sans">
                            <div>
                              <span className="block font-medium">Order Placed</span>
                              <span className="font-semibold text-dark/80 mt-0.5 block">{order.date}</span>
                            </div>
                            <div>
                              <span className="block font-medium">Order ID</span>
                              <span className="font-semibold text-dark/80 mt-0.5 block">{order.id}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="inline-flex items-center bg-secondary/10 text-secondary px-2.5 py-0.5 rounded-full text-[9px] font-sans font-bold uppercase tracking-wider">
                              {order.status}
                            </span>
                            <button
                              onClick={() => toast.success('Mock invoice download started.')}
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
                            <div key={idx} className="py-3.5 first:pt-0 last:pb-0 flex justify-between items-center text-xs sm:text-sm font-sans">
                              <div>
                                <h4 className="font-semibold text-dark leading-tight">{item.name}</h4>
                                <span className="text-[10px] text-gray-400 mt-0.5 block">Quantity: {item.quantity}</span>
                              </div>
                              <span className="font-display font-bold text-dark">${item.price.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>

                        {/* Order total footer */}
                        <div className="bg-light-gray/10 border-t border-border-gray/30 p-4 sm:px-5 flex justify-between items-center text-xs sm:text-sm font-display">
                          <span className="font-semibold text-gray-500">Total Paid</span>
                          <span className="font-bold text-primary text-base">${order.total.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}

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
                          setAddressForm({
                            name: '',
                            phone: '',
                            street: '',
                            country: 'India',
                            state: '',
                            district: '',
                            zip: '',
                            isDefault: false
                          });
                          setIsEditingAddress(true);
                        }}
                        className="bg-primary hover:bg-primary-light text-white text-xs font-semibold px-4 py-2.5 rounded-full flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                      >
                        <Plus size={14} />
                        <span>Add Address</span>
                      </button>
                    )}
                  </div>

                  {/* Add / Edit Address Form */}
                  {isEditingAddress ? (
                    <form onSubmit={handleAddressSubmit} className="bg-light-gray/25 border border-border-gray/40 rounded-3xl p-5 sm:p-6 space-y-4">
                      <h3 className="font-display font-bold text-sm text-dark border-b border-border-gray/30 pb-2">
                        {editingAddressId ? 'Edit Address Detail' : 'Register New Address'}
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-dark/70 font-display">Recipient Name *</label>
                          <input
                            type="text"
                            required
                            placeholder="Priyesh Patel"
                            value={addressForm.name}
                            onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                            className="w-full border border-border-gray/80 px-4 py-2.5 text-xs rounded-xl text-dark focus:outline-none focus:border-primary font-sans bg-white transition-colors"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-dark/70 font-display">Recipient Contact Phone *</label>
                          <input
                            type="text"
                            required
                            placeholder="+91 98765 43210"
                            value={addressForm.phone}
                            onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                            className="w-full border border-border-gray/80 px-4 py-2.5 text-xs rounded-xl text-dark focus:outline-none focus:border-primary font-sans bg-white transition-colors"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-dark/70 font-display">Street Address (House No, Building, Area) *</label>
                        <input
                          type="text"
                          required
                          placeholder="404 Luxury Tower, SG Highway"
                          value={addressForm.street}
                          onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                          className="w-full border border-border-gray/80 px-4 py-2.5 text-xs rounded-xl text-dark focus:outline-none focus:border-primary font-sans bg-white transition-colors"
                        />
                      </div>

                      {/* Dynamic Cascading Dropdowns matching Government Sites */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <SearchableDropdown
                          label="Country"
                          required
                          options={countryOptions}
                          value={addressForm.country}
                          onChange={handleCountryChange}
                        />

                        <SearchableDropdown
                          label="State"
                          required
                          options={stateOptions}
                          value={addressForm.state}
                          onChange={handleStateChange}
                          placeholder={addressForm.country ? "Select State" : "Choose Country first"}
                          disabled={!addressForm.country}
                        />

                        <SearchableDropdown
                          label="District"
                          required
                          options={districtOptions}
                          value={addressForm.district}
                          onChange={handleDistrictChange}
                          placeholder={addressForm.state ? "Select District" : "Choose State first"}
                          disabled={!addressForm.state}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-dark/70 font-display">ZIP / Postal Code *</label>
                          <input
                            type="text"
                            required
                            placeholder="380054"
                            value={addressForm.zip}
                            onChange={(e) => setAddressForm({ ...addressForm, zip: e.target.value })}
                            className="w-full border border-border-gray/80 px-4 py-2.5 text-xs rounded-xl text-dark focus:outline-none focus:border-primary font-sans bg-white transition-colors"
                          />
                        </div>

                        <div className="flex items-center gap-2 pt-6 font-display text-xs font-semibold text-dark/80">
                          <input
                            type="checkbox"
                            id="isDefault"
                            checked={addressForm.isDefault}
                            onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
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
                          className="bg-primary hover:bg-primary-light text-white px-5 py-2.5 rounded-full cursor-pointer transition-colors"
                        >
                          {editingAddressId ? 'Update Address' : 'Register Address'}
                        </button>
                        <button
                          type="button"
                          onClick={() => { setIsEditingAddress(false); setEditingAddressId(null); }}
                          className="bg-transparent border border-border-gray hover:bg-gray-100 text-dark/70 px-5 py-2.5 rounded-full cursor-pointer transition-colors"
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
                            className={`border rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between transition-colors ${
                              addr.isDefault 
                                ? 'border-primary/40 bg-primary/2' 
                                : 'border-border-gray/40 bg-white'
                            }`}
                          >
                            <div className="space-y-3 font-sans text-xs">
                              <span className={`inline-block border px-2 py-0.5 rounded-md font-display font-bold uppercase tracking-wider text-[8px] ${
                                addr.isDefault
                                  ? 'bg-primary/10 text-primary border-primary/20'
                                  : 'bg-gray-50 text-gray-500 border-border-gray/30'
                              }`}>
                                {addr.isDefault ? 'Primary Address' : 'Shipping Destination'}
                              </span>
                              <h4 className="font-semibold text-dark text-sm">{addr.name}</h4>
                              <div className="text-gray-500 space-y-0.5 leading-relaxed font-medium">
                                <p>{addr.street}</p>
                                <p>{addr.district}, {addr.state}</p>
                                <p>{addr.country} - {addr.zip}</p>
                                <p className="mt-1.5 block text-dark/80">Phone: {addr.phone}</p>
                              </div>
                            </div>

                            <div className="flex gap-4 pt-3.5 border-t border-border-gray/30 mt-4 text-xs font-display font-semibold">
                              <button
                                onClick={() => handleEditAddress(addr)}
                                className="text-primary hover:text-primary-light cursor-pointer flex items-center gap-1 focus:outline-none"
                              >
                                <Edit size={12} />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => handleDeleteAddress(addr._id)}
                                className="text-gray-400 hover:text-red-500 cursor-pointer flex items-center gap-1 focus:outline-none"
                              >
                                <Trash2 size={12} />
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-2 border border-dashed border-border-gray/80 rounded-2xl p-8 text-center space-y-2">
                          <MapPin size={24} className="text-gray-450 mx-auto" />
                          <h4 className="font-display font-semibold text-sm text-dark">No Addresses Registered</h4>
                          <p className="text-xs text-gray-400 font-sans max-w-xs mx-auto">
                            Add a secure delivery location above to speed up order checkouts.
                          </p>
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
