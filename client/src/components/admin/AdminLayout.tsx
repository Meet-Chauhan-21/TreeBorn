import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import Sidebar from './Sidebar';
import Header from './Header';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const titles: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/products': 'Products',
  '/admin/products/create': 'Create Product',
  '/admin/products/edit': 'Edit Product',
  '/admin/orders': 'Orders',
  '/admin/users': 'Users',
  '/admin/settings': 'Settings',
  '/admin/categories': 'Categories',
  '/admin/homepage-images': 'Homepage Images',
};

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        toast.error('Please login to access the admin portal');
        navigate('/login');
      } else if (user.role !== 'admin') {
        toast.error('Access Denied. Admin privileges required');
        navigate('/');
      }
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  if (loading || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const pageTitle = title || titles[location.pathname] || 'Admin';

  const confirmLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#fafafc] admin-theme font-sans">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <Header
        title={pageTitle}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        setMobileMenuOpen={setMobileMenuOpen}
        mobileMenuOpen={mobileMenuOpen}
        onLogout={() => setShowLogoutConfirm(true)}
      />

      <main
        className={`pt-20 min-h-screen transition-all duration-300 ${
          collapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        <div className="p-8">{children}</div>
      </main>

      {/* Global Admin Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4 border border-gray-150 animate-scale-in">
            <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle size={24} />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-gray-900">Logout Confirmation</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-sans">
                Are you sure you want to log out of the admin portal? Any unsaved settings change might be lost.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold text-xs rounded-xl border border-gray-200 transition cursor-pointer focus:outline-none"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmLogout}
                className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl transition cursor-pointer focus:outline-none"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLayout;
