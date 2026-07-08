import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { User, ShoppingBag, MapPin, Gift, LogOut, Shield, Download, Mail, Phone, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Container from '../components/layout/Container';
import WhatsAppButton from '../components/layout/WhatsAppButton';

export const Profile: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'addresses' | 'rewards'>('profile');
  const [userInfo, setUserInfo] = useState({
    name: 'Meet Chauhan',
    email: 'meet.chauhan@example.com',
    phone: '+91 98765 43210',
  });

  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Profile settings updated successfully!');
  };

  const mockOrders = [
    {
      id: 'AURA-9801',
      date: 'July 05, 2026',
      status: 'Delivered',
      items: [
        { name: 'Restorative Peptide Serum', quantity: 1, price: 85.00 },
        { name: 'Gentle Hydrating Cleanser', quantity: 1, price: 36.00 },
      ],
      total: 121.00,
    },
    {
      id: 'AURA-8564',
      date: 'May 18, 2026',
      status: 'Delivered',
      items: [
        { name: 'Barrier Renewal Cream', quantity: 1, price: 68.00 },
      ],
      total: 68.00,
    },
  ];

  const mockAddresses = [
    {
      id: 'add-1',
      type: 'Shipping Address (Primary)',
      name: 'Meet Chauhan',
      street: '404 Luxury Tower, SG Road',
      city: 'Ahmedabad, Gujarat',
      zip: '380054',
      phone: '+91 98765 43210',
    },
    {
      id: 'add-2',
      type: 'Billing Address',
      name: 'Meet Chauhan',
      street: '404 Luxury Tower, SG Road',
      city: 'Ahmedabad, Gujarat',
      zip: '380054',
      phone: '+91 98765 43210',
    },
  ];

  const tabOptions = [
    { id: 'profile' as const, label: 'Profile Details', icon: <User size={16} /> },
    { id: 'orders' as const, label: 'Orders Log', icon: <ShoppingBag size={16} /> },
    { id: 'addresses' as const, label: 'Addresses', icon: <MapPin size={16} /> },
    { id: 'rewards' as const, label: 'Rewards Club', icon: <Gift size={16} /> },
  ];

  return (
    <>
      <Helmet>
        <title>Your Account — AURA Skincare</title>
      </Helmet>

      <Navbar />

      <main className="pt-28 pb-20 bg-light-gray/30">
        <Container>
          
          {/* Main Layout Header (mobile friendly card) */}
          <div className="bg-white border border-border-gray/40 rounded-3xl p-5 sm:p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs mt-6">
            
            {/* User Profile Summary */}
            <div className="flex items-center gap-4">
              {/* Initials Avatar */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-accent-sage border border-accent-sage-dark flex items-center justify-center text-primary font-display font-bold text-lg sm:text-xl shadow-inner flex-shrink-0">
                MC
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-display font-semibold text-dark leading-tight">
                    {userInfo.name}
                  </h1>
                  <span className="bg-primary/5 text-primary border border-primary/10 px-2 py-0.5 rounded-full font-sans font-bold text-[9px] uppercase tracking-wider">
                    Gold Member
                  </span>
                </div>
                <p className="text-gray-500 text-xs font-sans flex items-center gap-1">
                  <Mail size={12} className="opacity-60" />
                  <span>{userInfo.email}</span>
                </p>
                <p className="text-gray-400 text-[10px] font-sans flex items-center gap-1 pt-0.5">
                  <Calendar size={12} className="opacity-50" />
                  <span>AURA Circle member since 2024</span>
                </p>
              </div>
            </div>

            {/* Quick Rewards Overview card */}
            <div className="bg-accent-sage/40 border border-accent-sage-dark/30 rounded-2xl p-4 flex items-center justify-between gap-6 md:w-auto flex-grow md:flex-grow-0 max-w-xs md:max-w-none">
              <div>
                <span className="text-[10px] text-primary/70 font-bold font-display uppercase tracking-widest block mb-0.5">
                  Rewards Points
                </span>
                <span className="text-2xl font-display font-bold text-primary block leading-none">
                  240 pts
                </span>
              </div>
              <div className="h-8 w-px bg-accent-sage-dark/60" />
              <div>
                <span className="text-[10px] text-gray-500 font-sans block mb-0.5">Active Level</span>
                <span className="text-xs font-display font-semibold text-dark block flex items-center gap-1">
                  <Shield size={12} className="text-secondary" />
                  <span>Gold Circle</span>
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Mobile Horizontal Tabs Row (desktop vertical sidebar) */}
            <div className="lg:col-span-3 flex flex-col gap-4">
              
              {/* Horizontal sliding tabs container for mobile */}
              <div className="flex lg:flex-col overflow-x-auto scrollbar-none gap-2 bg-white border border-border-gray/30 p-2.5 rounded-2xl shadow-xs lg:sticky lg:top-24">
                {tabOptions.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs sm:text-sm font-display font-semibold transition-all whitespace-nowrap cursor-pointer flex-grow lg:flex-grow-0 ${
                      activeTab === tab.id
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-dark/70 hover:bg-gray-100 hover:text-dark'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
                
                <div className="hidden lg:block border-t border-border-gray/40 my-2 pt-2" />
                
                <button
                  onClick={() => toast.info('Log out completed.')}
                  className="hidden lg:flex items-center gap-2 px-4 py-3 rounded-xl text-xs sm:text-sm font-display font-semibold text-red-500 hover:bg-red-50/40 transition-all cursor-pointer"
                >
                  <LogOut size={16} />
                  <span>Log Out</span>
                </button>
              </div>
            </div>

            {/* Main Content Details Panel */}
            <div className="lg:col-span-9 bg-white border border-border-gray/30 rounded-3xl p-5 sm:p-8 shadow-xs">
              
              {/* Tab 1: Profile Form */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div className="border-b border-border-gray/40 pb-4">
                    <h2 className="text-lg font-display font-semibold text-dark">Personal Information</h2>
                    <p className="text-xs text-gray-500 mt-1 font-sans">
                      Ensure your details are up to date for streamlined shipping and checkouts.
                    </p>
                  </div>

                  <form onSubmit={handleSaveInfo} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-dark/70 font-display flex items-center gap-1">
                          <User size={12} className="opacity-60" />
                          <span>Full Name</span>
                        </label>
                        <input
                          type="text"
                          value={userInfo.name}
                          onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
                          className="w-full border border-border-gray/80 px-4 py-3 text-sm rounded-xl text-dark focus:outline-none focus:border-primary font-sans bg-light-gray/20"
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
                          className="w-full border border-border-gray/80 px-4 py-3 text-sm rounded-xl text-dark focus:outline-none focus:border-primary font-sans bg-light-gray/20"
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
                        className="w-full border border-border-gray/80 px-4 py-3 text-sm rounded-xl text-dark focus:outline-none focus:border-primary font-sans bg-light-gray/20"
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
                        onClick={() => toast.info('Log out completed.')}
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
                      Track active deliveries and review previous botanical purchases.
                    </p>
                  </div>

                  <div className="space-y-5">
                    {mockOrders.map((order) => (
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
                  </div>
                </div>
              )}

              {/* Tab 3: Addresses */}
              {activeTab === 'addresses' && (
                <div className="space-y-6">
                  <div className="border-b border-border-gray/40 pb-4">
                    <h2 className="text-lg font-display font-semibold text-dark">Saved Addresses</h2>
                    <p className="text-xs text-gray-500 mt-1 font-sans">
                      Add or modify your shipping locations to speed up standard checkouts.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {mockAddresses.map((addr) => (
                      <div
                        key={addr.id}
                        className="border border-border-gray/40 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between"
                      >
                        <div className="space-y-3 font-sans text-xs">
                          <span className="inline-block bg-primary/5 text-primary border border-primary/10 px-2 py-0.5 rounded-md font-display font-bold uppercase tracking-wider text-[9px]">
                            {addr.type}
                          </span>
                          <h4 className="font-semibold text-dark text-sm">{addr.name}</h4>
                          <div className="text-gray-500 space-y-0.5 leading-relaxed font-medium">
                            <p>{addr.street}</p>
                            <p>{addr.city}, {addr.zip}</p>
                            <p className="mt-1 block">Phone: {addr.phone}</p>
                          </div>
                        </div>

                        <div className="flex gap-4 pt-3.5 border-t border-border-gray/30 mt-4 text-xs font-display font-semibold">
                          <button
                            onClick={() => toast.info('Edit address dialog opened.')}
                            className="text-primary hover:text-primary-light cursor-pointer focus:outline-none"
                          >
                            Edit Address
                          </button>
                          <button
                            onClick={() => toast.info('Delete address completed.')}
                            className="text-gray-400 hover:text-red-500 cursor-pointer focus:outline-none"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 4: Rewards */}
              {activeTab === 'rewards' && (
                <div className="space-y-6">
                  <div className="border-b border-border-gray/40 pb-4">
                    <h2 className="text-lg font-display font-semibold text-dark">AURA Rewards Club</h2>
                    <p className="text-xs text-gray-500 mt-1 font-sans">
                      Earn rewards points on botanicals purchase and redeem them for shopping vouchers.
                    </p>
                  </div>

                  {/* Tier Card */}
                  <div className="bg-gradient-to-tr from-primary-dark via-primary to-secondary/35 rounded-3xl p-5 sm:p-6 text-white relative overflow-hidden shadow-sm">
                    {/* Glow ornament */}
                    <div className="absolute right-0 bottom-0 w-36 h-36 rounded-full bg-white/5 blur-2xl pointer-events-none" />
                    
                    <div className="flex items-center gap-3.5 mb-5">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                        <Shield size={18} />
                      </div>
                      <div>
                        <span className="text-[9px] text-white/70 font-bold uppercase tracking-wider block font-sans">Loyalty Level</span>
                        <h3 className="font-display font-bold text-base sm:text-lg">AURA Gold Circle</h3>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 items-end">
                      <div>
                        <span className="text-[10px] text-white/70 font-sans block">Current Points Balance</span>
                        <span className="text-3xl font-display font-bold block mt-1 leading-none">240</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] text-white bg-white/15 px-2.5 py-1 rounded-full font-sans font-semibold inline-block">
                          2x Points Multiplier
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Points breakdown details */}
                  <div className="space-y-3.5 pt-2">
                    <h4 className="font-display font-semibold text-xs sm:text-sm text-dark uppercase tracking-wider block">
                      Available Redemptions
                    </h4>
                    <div className="divide-y divide-border-gray/30 border border-border-gray/40 rounded-2xl overflow-hidden font-sans shadow-2xs">
                      
                      <div className="p-4 flex items-center justify-between text-xs sm:text-sm bg-white hover:bg-light-gray/20 transition-colors">
                        <div>
                          <h5 className="font-semibold text-dark">$15 Shopping Voucher</h5>
                          <span className="text-[9px] text-gray-400 block mt-0.5">Requires 150 points</span>
                        </div>
                        <button
                          onClick={() => toast.success('Redeemed $15 Shopping Voucher! Vouchers code sent to email.')}
                          className="bg-primary hover:bg-primary-light text-white text-[10px] font-semibold px-4 py-2 rounded-full cursor-pointer transition-colors shadow-2xs"
                        >
                          Redeem
                        </button>
                      </div>

                      <div className="p-4 flex items-center justify-between text-xs sm:text-sm bg-white">
                        <div>
                          <h5 className="font-semibold text-dark">$30 Shopping Voucher</h5>
                          <span className="text-[9px] text-gray-400 block mt-0.5">Requires 280 points</span>
                        </div>
                        <button
                          disabled
                          className="bg-gray-100 text-gray-400 text-[10px] font-semibold px-4 py-2 rounded-full cursor-not-allowed border border-gray-150"
                        >
                          Need 40 pts
                        </button>
                      </div>
                    </div>
                  </div>
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
