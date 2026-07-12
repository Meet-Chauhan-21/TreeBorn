import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  PanelLeftClose,
  TreeDeciduous,
  FileText,
  Folder,
  Image
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: Package, label: 'Products', path: '/admin/products' },
  { icon: ShoppingCart, label: 'Orders', path: '/admin/orders' },
  { icon: Users, label: 'Users', path: '/admin/users' },
  { icon: Settings, label: 'Settings', path: '/admin/settings' },
  { icon: Folder, label: 'Categories', path: '/admin/categories' },
  { icon: Image, label: 'Homepage Images', path: '/admin/homepage-images' },
  { icon: FileText, label: 'Legal Pages', path: '/admin/legal' },
];

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const location = useLocation();

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-white border-r border-slate-200/80 transition-all duration-300 z-30 ${collapsed ? 'w-20' : 'w-64'
        }`}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-sm">
                <TreeDeciduous size={20} />
              </div>
              <span className="text-xl font-bold text-slate-950 tracking-tight">TreeBorn</span>
            </div>
          )}
          {collapsed && (
            <div className="flex-1 flex justify-center">
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-sm">
                <TreeDeciduous size={20} />
              </div>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="p-1.5 hover:bg-slate-50 border border-slate-100 hover:border-slate-200 rounded-lg transition-all text-slate-500 hover:text-slate-800 cursor-pointer"
              title="Collapse Sidebar"
            >
              <PanelLeftClose size={17} />
            </button>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-150 group ${isActive
                    ? 'bg-indigo-50/50 text-indigo-600 border border-indigo-100/30 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                  }`}
              >
                <item.icon
                  size={18}
                  className={isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-700'}
                />
                {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
