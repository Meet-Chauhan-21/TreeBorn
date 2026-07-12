import React, { useState } from 'react';
import { Search, Bell, LogOut, Menu, X, Globe, PanelLeftOpen } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

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
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

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
            placeholder="Search anything..."
            className="pl-11 pr-4 py-2 w-80 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-500 transition-all placeholder-slate-400"
          />
        </div>

        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 hover:text-slate-950 text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-2xs"
        >
          <Globe size={13} className="text-slate-500" />
          <span className="hidden sm:inline">View Website</span>
        </button>

        <button className="relative p-2 hover:bg-slate-50 border border-transparent hover:border-slate-200 rounded-xl transition-all">
          <Bell size={18} className="text-slate-600" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full"></span>
        </button>

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
