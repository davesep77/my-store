
import React from 'react';
import {
    ShoppingBag,
    Package,
    Layers,
    Box,
    FileText,
    Grid,
    Users,
    UserCircle,
    Wrench,
    Truck,
    ShoppingCart,
    ClipboardList,
    Settings,
    Clock,
    CreditCard,
    BarChart2,
    Shield,
    Tag,
    Globe,
    Percent,
    LogOut
} from 'lucide-react';
import { Tab } from '../types';

interface ManagementGridProps {
    onNavigate: (tab: Tab) => void;
}

interface GridItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    shortcut: string;
    color: 'green' | 'blue';
    action?: () => void;
    targetTab?: Tab;
}

export const ManagementGrid: React.FC<ManagementGridProps> = ({ onNavigate }) => {

    const handleItemClick = (item: GridItem) => {
        if (item.targetTab) {
            onNavigate(item.targetTab);
        } else if (item.action) {
            item.action();
        } else {
            alert(`Feature: ${item.label} coming soon!`);
        }
    };

    const gridItems: GridItem[] = [
        // Row 1
        { id: 'cashier', label: 'Cashier', icon: <ShoppingBag size={24} />, shortcut: '1', color: 'green', targetTab: 'sales' },
        { id: 'inventory', label: 'Inventory Maintenance', icon: <Package size={24} />, shortcut: 'A', color: 'blue', targetTab: 'items' },
        { id: 'dept', label: 'Department Maintenance', icon: <Layers size={24} />, shortcut: 'B', color: 'blue', targetTab: 'departments' },
        { id: 'kit', label: 'Kit Maintenance', icon: <Box size={24} />, shortcut: 'C', color: 'blue', targetTab: 'kits' },

        // Row 2
        { id: 'invoice', label: 'Invoice Properties', icon: <FileText size={24} />, shortcut: '2', color: 'green', targetTab: 'invoice-properties' },
        { id: 'styles', label: 'Styles Matrix', icon: <Grid size={24} />, shortcut: 'D', color: 'blue', targetTab: 'styles' },
        { id: 'customer', label: 'Customer Maintenance', icon: <Users size={24} />, shortcut: 'E', color: 'blue', targetTab: 'customers' },
        { id: 'employee', label: 'Employee Maintenance', icon: <UserCircle size={24} />, shortcut: 'F', color: 'blue', targetTab: 'employees' },

        // Row 3
        { id: 'tools', label: 'Tools', icon: <Wrench size={24} />, shortcut: '3', color: 'green' },
        { id: 'vendor', label: 'Vendor Maintenance', icon: <Truck size={24} />, shortcut: 'G', color: 'blue', targetTab: 'vendors' },
        { id: 'purchase', label: 'Purchase Orders', icon: <ShoppingCart size={24} />, shortcut: 'H', color: 'blue', targetTab: 'purchase' },
        { id: 'backorders', label: 'Back Orders', icon: <ClipboardList size={24} />, shortcut: 'I', color: 'blue', targetTab: 'back-orders' },

        // Row 4
        { id: 'setup', label: 'Setup', icon: <Settings size={24} />, shortcut: '4', color: 'green', targetTab: 'settings' },
        { id: 'time', label: 'Time Clock Management', icon: <Clock size={24} />, shortcut: 'J', color: 'blue', targetTab: 'time-clock' },
        { id: 'credit', label: 'Credit Card Settlement', icon: <CreditCard size={24} />, shortcut: 'K', color: 'blue', targetTab: 'settlements' },
        { id: 'reporting', label: 'Reporting', icon: <BarChart2 size={24} />, shortcut: 'L', color: 'blue', targetTab: 'report' },

        // Row 5
        { id: 'admin', label: 'Administrative', icon: <Shield size={24} />, shortcut: '5', color: 'green' },
        { id: 'custprices', label: 'Customer Item Prices', icon: <Tag size={24} />, shortcut: 'M', color: 'blue', targetTab: 'customer-prices' },
        { id: 'globalprices', label: 'Global Price Changes', icon: <Globe size={24} />, shortcut: 'N', color: 'blue', targetTab: 'global-pricing' },
        { id: 'mixmatch', label: "Mix 'N Match Pricing", icon: <Percent size={24} />, shortcut: 'O', color: 'blue', targetTab: 'pricing' },
    ];

    return (
        <div className="flex h-full w-full items-center justify-center p-4">
            <div className="bg-white/50 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20 w-full max-w-6xl flex gap-4">

                {/* Main Grid */}
                <div className="grid grid-cols-4 gap-4 flex-1">
                    {gridItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => handleItemClick(item)}
                            className={`
                relative overflow-hidden group p-4 h-28 rounded-xl flex flex-col items-center justify-center text-center transition-all duration-300
                hover:scale-[1.02] active:scale-95 shadow-lg
                ${item.color === 'green'
                                    ? 'bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-emerald-500/20 hover:shadow-emerald-500/40'
                                    : 'bg-gradient-to-br from-blue-400 to-indigo-600 text-white shadow-blue-500/20 hover:shadow-blue-500/40'
                                }
              `}
                        >
                            {/* Shortcut Badge */}
                            <div className="absolute top-2 left-2 px-2 py-0.5 bg-white/20 rounded text-xs font-bold backdrop-blur-sm">
                                {item.shortcut}
                            </div>

                            {/* Icon */}
                            <div className="mb-2 p-2 bg-white/20 rounded-full group-hover:scale-110 transition-transform duration-300">
                                {item.icon}
                            </div>

                            {/* Label */}
                            <span className="text-sm font-bold leading-tight max-w-[90%]">
                                {item.label}
                            </span>

                            {/* Shine effect */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        </button>
                    ))}
                </div>

                {/* Exit Bar */}
                <div className="w-24 flex flex-col">
                    <button
                        onClick={() => onNavigate('dashboard')}
                        className="h-full w-full bg-gradient-to-b from-slate-700 to-slate-900 text-white rounded-xl flex flex-col items-center justify-center gap-4 hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-900/20 group"
                    >
                        <div className="p-3 bg-white/10 rounded-full group-hover:bg-red-500/20 transition-colors">
                            <LogOut size={32} className="group-hover:text-red-400 transition-colors" />
                        </div>
                        <span className="font-bold text-lg tracking-widest vertical-text" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                            EXIT
                        </span>
                    </button>
                </div>

            </div>
        </div>
    );
};
