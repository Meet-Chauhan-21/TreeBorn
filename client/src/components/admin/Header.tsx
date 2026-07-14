import React, { useState, useEffect } from 'react';
import { Search, Bell, LogOut, Menu, X, Globe, PanelLeftOpen, Trash2, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config';
import { toast } from 'sonner';

interface HeaderProps {
  title: string;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  setMobileMenuOpen: (open: boolean) => void;
  mobileMenuOpen: boolean;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  collapsed,
  setCollapsed,
  setMobileMenuOpen,
  mobileMenuOpen,
  onLogout,
}) => {
  const { user, accessToken } = useAuth();
  const { products } = useStore();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [bellOpen, setBellOpen] = useState(false);

  const fetchNotifications = async () => {
    if (!accessToken) return;
    try {
      const response = await fetch(`${API_BASE_URL}/admin/notifications`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchNotifications();
      const timer = setInterval(fetchNotifications, 30000);
      return () => clearInterval(timer);
    }
  }, [accessToken]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (!val.trim()) {
      setSearchResults([]);
    } else {
      const filtered = products.filter((p) =>
        p.name.toLowerCase().includes(val.toLowerCase()) ||
        (p.category && p.category.toLowerCase().includes(val.toLowerCase()))
      );
      setSearchResults(filtered);
    }
  };

  const handleSearchResultClick = (productId: string) => {
    navigate(`/admin/products/${productId}`);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleNotificationClick = async (notif: any) => {
    if (!accessToken) return;
    if (!notif.isRead) {
      try {
        await fetch(`${API_BASE_URL}/admin/notifications/${notif._id}/read`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setNotifications(prev =>
          prev.map(n => (n._id === notif._id ? { ...n, isRead: true } : n))
        );
      } catch (err) {
        console.error(err);
      }
    }
    setBellOpen(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const handleClearAllNotifications = async () => {
    if (!accessToken) return;
    try {
      const response = await fetch(`${API_BASE_URL}/admin/notifications`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (response.ok) {
        setNotifications([]);
        toast.success('All notifications cleared');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to clear notifications');
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleLogout = () => {
    setDropdownOpen(false);
    onLogout();
  };

  return (
    <header
      className={`fixed top-0 right-0 h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/80 z-20 flex items-center justify-between px-8 transition-all duration-300 ${
        collapsed ? 'left-20' : 'left-64'
      }`}
    >
      <div className="flex items-center gap-2">
        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="p-1.5 hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800 transition-all mr-1 cursor-pointer shadow-3xs flex items-center justify-center"
            title="Expand Sidebar"
          >
            <PanelLeftOpen size={17} />
          </button>
        )}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-600"
        >
          {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
          <p className="text-xs text-slate-500 mt-0.5">Admin Portal</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search premium skincare..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-11 pr-4 py-2 w-80 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-500 transition-all placeholder-slate-400 font-sans"
          />
          {searchQuery && (
            <div className="absolute left-0 mt-2 w-85 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 max-h-80 overflow-y-auto divide-y divide-slate-100">
              {searchResults.length > 0 ? (
                searchResults.map((product) => (
                  <button
                    key={product.id || product._id}
                    onClick={() => handleSearchResultClick(product.id || product._id)}
                    className="w-full flex items-center gap-3 p-3.5 hover:bg-slate-50 transition-colors text-left focus:outline-none cursor-pointer"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-10 h-10 rounded-lg object-cover border border-slate-150"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs text-slate-900 truncate leading-tight">{product.name}</h4>
                      <span className="text-[10px] text-indigo-650 font-bold uppercase tracking-wider block mt-0.5">{product.category}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-950 whitespace-nowrap">₹{Number(product.price).toFixed(2)}</span>
                  </button>
                ))
              ) : (
                <div className="p-5 text-center text-xs text-slate-400 font-sans">
                  No products found matching "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>

        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 hover:text-slate-950 text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-2xs"
        >
          <Globe size={13} className="text-slate-500" />
          <span className="hidden sm:inline">View Website</span>
        </button>

        <div className="relative">
          <button
            onClick={() => setBellOpen(!bellOpen)}
            className="relative p-2 hover:bg-slate-50 border border-transparent hover:border-slate-200 rounded-xl transition-all cursor-pointer focus:outline-none"
          >
            <Bell size={18} className="text-slate-600" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-600 text-white rounded-full text-[9px] font-sans font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {bellOpen && (
            <>
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200/80 py-2.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="px-4 py-2 border-b border-slate-100 flex justify-between items-center">
                  <div>
                    <p className="text-xs font-bold text-slate-900">Notifications</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{unreadCount} unread updates</p>
                  </div>
                  {notifications.length > 0 && (
                    <button
                      onClick={handleClearAllNotifications}
                      className="text-rose-600 hover:text-rose-700 text-[10px] font-bold flex items-center gap-1 cursor-pointer focus:outline-none"
                    >
                      <Trash2 size={12} />
                      Clear all
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <button
                        key={notif._id}
                        onClick={() => handleNotificationClick(notif)}
                        className={`w-full text-left p-3.5 hover:bg-slate-50/50 transition-colors flex gap-3 focus:outline-none cursor-pointer ${
                          !notif.isRead ? 'bg-indigo-50/5' : ''
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <h4 className={`text-xs leading-snug truncate ${!notif.isRead ? 'font-bold text-slate-900' : 'text-slate-700'}`}>
                              {notif.title}
                            </h4>
                            {!notif.isRead && (
                              <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full shrink-0 mt-1.5" />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1 leading-normal break-words font-sans">
                            {notif.message}
                          </p>
                          <span className="text-[9px] text-slate-400 mt-2 flex items-center gap-1 font-sans">
                            <Clock size={10} />
                            {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(notif.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="py-8 text-center text-xs text-slate-450 font-sans">
                      No notifications available
                    </div>
                  )}
                </div>
              </div>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setBellOpen(false)}
              />
            </>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 p-1.5 pr-3 hover:bg-slate-50 border border-transparent hover:border-slate-200/50 rounded-xl transition-all"
          >
            <div className="w-8 h-8 bg-slate-100 text-slate-800 border border-slate-200 rounded-lg flex items-center justify-center font-bold text-sm shadow-2xs">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="text-left hidden md:block">
              <p className="text-xs font-bold text-slate-900 leading-tight">{user?.name}</p>
              <p className="text-[10px] text-slate-500">Administrator</p>
            </div>
          </button>

          {dropdownOpen && (
            <>
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200/80 py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">{user?.name}</p>
                  <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2.5 flex items-center gap-2.5 text-xs font-medium text-rose-600 hover:bg-rose-50/50 transition-colors"
                >
                  <LogOut size={15} />
                  Logout
                </button>
              </div>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setDropdownOpen(false)}
              />
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
