import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
};

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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

  return (
    <div className="min-h-screen bg-[#fafafc] admin-theme font-sans">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <Header
        title={pageTitle}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        setMobileMenuOpen={setMobileMenuOpen}
        mobileMenuOpen={mobileMenuOpen}
      />

      <main
        className={`pt-20 min-h-screen transition-all duration-300 ${
          collapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
};

export default AdminLayout;
