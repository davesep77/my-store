import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  TrendingUp,
  ShoppingCart,
  FileText,
  Settings as SettingsIcon,
  ChevronLeft,
  ChevronRight,
  User as UserIcon,
  Menu,
  X,
  LogOut,
  LayoutGrid,
  ShieldCheck
} from 'lucide-react';
import { Tab, User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  user: User;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, user, onLogout }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Auto-close mobile menu when tab changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [activeTab]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'management', label: 'Management', icon: <LayoutGrid size={20} /> },
    { id: 'items', label: 'All Items', icon: <Package size={20} /> },
    { id: 'new-stocks', label: 'New Stocks In', icon: <PlusCircle size={20} /> },
    { id: 'sales', label: 'Sales', icon: <TrendingUp size={20} /> },
    { id: 'purchase', label: 'Purchase', icon: <ShoppingCart size={20} /> },
    { id: 'report', label: 'Report', icon: <FileText size={20} /> },
    ...(user.role === 'admin' ? [{ id: 'admin-approvals', label: 'Admin Approvals', icon: <ShieldCheck size={20} /> }] : []),
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 flex items-center justify-between overflow-hidden">
        {(!collapsed || mobileMenuOpen) && (
          <div className="flex items-center gap-2 animate-in fade-in duration-300">
            <div className="bg-white p-1.5 rounded-xl shadow-inner">
              <Package className="text-[#8E54E9]" size={20} />
            </div>
            <h1 className="text-xl font-black whitespace-nowrap tracking-tight">My Store</h1>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex p-1.5 hover:bg-white/10 rounded-lg transition-all active:scale-90"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
        <button
          onClick={() => setMobileMenuOpen(false)}
          className="md:hidden p-1.5 hover:bg-white/10 rounded-lg transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      <nav className="flex-1 mt-4 px-3 space-y-2 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as Tab)}
            className={`w-full flex items-center p-3 rounded-2xl transition-all duration-200 group relative ${activeTab === item.id
              ? 'bg-white/20 font-bold shadow-lg shadow-black/10'
              : 'hover:bg-white/10 opacity-70 hover:opacity-100'
              }`}
          >
            <span className={`min-w-[24px] transition-transform duration-200 ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'}`}>
              {item.icon}
            </span>
            {(!collapsed || mobileMenuOpen) && <span className="ml-3 truncate animate-in slide-in-from-left-2">{item.label}</span>}
            {activeTab === item.id && (
              <div className="absolute left-0 w-1 h-6 bg-white rounded-r-full shadow-glow" />
            )}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10 space-y-2">
        <button
          onClick={() => setActiveTab('settings')}
          className={`w-full flex items-center p-3 rounded-2xl transition-all ${activeTab === 'settings' ? 'bg-white/20' : 'hover:bg-white/10 opacity-70 hover:opacity-100'
            }`}
        >
          <SettingsIcon size={20} />
          {(!collapsed || mobileMenuOpen) && <span className="ml-3 font-bold">Settings</span>}
        </button>

        <div className="flex flex-col gap-2 p-3 bg-black/10 rounded-3xl border border-white/5">
          <div className="flex items-center">
            <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center border-2 border-white/10 shadow-lg">
              <UserIcon size={18} />
            </div>
            {(!collapsed || mobileMenuOpen) && (
              <div className="ml-3 overflow-hidden">
                <p className="text-sm font-black truncate">{user.fullName}</p>
                <p className="text-[10px] opacity-60 truncate uppercase tracking-widest">{user.role}</p>
              </div>
            )}
          </div>
          {(!collapsed || mobileMenuOpen) && (
            <button
              onClick={onLogout}
              className="mt-2 w-full flex items-center justify-center gap-2 py-2 bg-red-500/20 hover:bg-red-500/40 text-red-100 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-95"
            >
              <LogOut size={14} />
              Logout Session
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#FDFDFF] relative">
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-[45] md:hidden backdrop-blur-md transition-all duration-300"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - fixed on mobile, sticky on desktop */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 md:sticky md:top-0 h-screen bg-[#8E54E9] text-white flex flex-col shadow-2xl transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1)
        ${mobileMenuOpen ? 'translate-x-0 w-72' : '-translate-x-full md:translate-x-0'}
        ${collapsed ? 'md:w-24' : 'md:w-72'}
      `}>
        <SidebarContent />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="md:hidden bg-white/80 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-gray-100 sticky top-0 z-[40] shadow-sm">
          <div className="flex items-center gap-2">
            <div className="bg-[#8E54E9] p-2 rounded-xl shadow-lg shadow-purple-100">
              <Package className="text-white" size={18} />
            </div>
            <h1 className="text-xl font-black text-gray-800 tracking-tight">My Store</h1>
          </div>
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition-all active:scale-90"
          >
            <Menu size={24} />
          </button>
        </header>

        <main className="flex-1 p-4 md:p-10 lg:p-12 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-8 pb-10">
            {children}
          </div>
        </main>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.15); border-radius: 10px; }
        .shadow-glow { box-shadow: 0 0 8px rgba(255,255,255,0.6); }
      `}</style>
    </div>
  );
};
