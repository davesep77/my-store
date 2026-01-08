
import React, { useState, useMemo } from 'react';
import { Search, Edit2, Trash2, FileSpreadsheet, FileText as FilePdf, X, ChevronDown, Filter } from 'lucide-react';
import { Item, Transaction, UserSettings } from '../types';

interface InventoryProps {
  items: Item[];
  transactions: Transaction[];
  onUpdate: (item: Item) => void;
  onDelete: (id: string) => void;
  settings: UserSettings;
}

export const Inventory: React.FC<InventoryProps> = ({ items, transactions, settings, onUpdate, onDelete }) => {
  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'low-stock'>('all');

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                          item.sku.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterMode === 'all' || item.stock <= (item.stockAlertLevel || 5);
    return matchesSearch && matchesFilter;
  });

  const fmt = (val: number) => {
    return new Intl.NumberFormat(settings.locale, {
      style: 'currency',
      currency: settings.currency,
    }).format(val);
  };

  const itemMetrics = useMemo(() => {
    const metrics: Record<string, {
      totalPurchase: number;
      totalSales: number;
      openingStock: number;
      purchaseValue: number;
      consumptionValue: number;
    }> = {};

    items.forEach(item => {
      const itemTransactions = transactions.filter(t => t.itemId === item.id);
      
      const openingStock = itemTransactions
        .filter(t => t.type === 'opening')
        .reduce((sum, t) => sum + t.quantity, 0);
        
      const totalPurchase = itemTransactions
        .filter(t => t.type === 'purchase')
        .reduce((sum, t) => sum + t.quantity, 0);
        
      const totalSales = itemTransactions
        .filter(t => t.type === 'sale')
        .reduce((sum, t) => sum + t.quantity, 0);

      const purchaseValue = itemTransactions
        .filter(t => t.type === 'purchase')
        .reduce((sum, t) => sum + (t.quantity * t.unitPrice), 0);

      const consumptionValue = itemTransactions
        .filter(t => t.type === 'sale')
        .reduce((sum, t) => sum + (t.quantity * t.unitPrice), 0);

      metrics[item.id] = {
        openingStock,
        totalPurchase,
        totalSales,
        purchaseValue,
        consumptionValue
      };
    });

    return metrics;
  }, [items, transactions]);

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold text-gray-800">All Items</h2>
          <p className="text-xs text-gray-400">Total {items.length} unique products in inventory</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 min-w-[200px] md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Type to Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-transparent border focus:border-[#8E54E9] rounded-xl text-sm focus:ring-0 focus:bg-white transition-all outline-none"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setSearch('')}
              className="flex items-center gap-2 px-4 py-2.5 bg-yellow-50 text-yellow-700 rounded-xl hover:bg-yellow-100 text-xs font-bold transition-all hover:scale-105"
            >
              <X size={14} />
              CLEAR
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-[#8E54E9] text-white rounded-xl hover:bg-[#7c47d3] text-xs font-bold transition-all hover:scale-105 shadow-md shadow-purple-50">
              <FilePdf size={14} />
              PDF
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-purple-50 text-[#8E54E9] rounded-xl hover:bg-purple-100 text-xs font-bold transition-all hover:scale-105">
              EXCEL
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left text-sm min-w-[1200px]">
          <thead className="bg-gray-50/80 text-gray-400 font-bold">
            <tr className="border-b">
              <th className="px-6 py-4">Product Details</th>
              <th className="px-6 py-4">Stocks</th>
              <th className="px-6 py-4">Unit Cost</th>
              <th className="px-6 py-4">Price</th>
              <th className="px-6 py-4">Stock Value</th>
              <th className="px-6 py-4">Purchase</th>
              <th className="px-6 py-4">Sales</th>
              <th className="px-6 py-4">Opening</th>
              <th className="px-6 py-4">P. Value</th>
              <th className="px-6 py-4">C. Value</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredItems.map(item => {
              const m = itemMetrics[item.id];
              const isLow = item.stock <= (item.stockAlertLevel || 5);
              return (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-800">{item.name}</div>
                    <div className="text-[10px] text-gray-400 tracking-wider uppercase">{item.sku}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${isLow ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-green-50 text-green-600'}`}>
                      {item.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 font-medium">{fmt(item.unitCost)}</td>
                  <td className="px-6 py-4 text-gray-600 font-medium">{fmt(item.sellingPrice)}</td>
                  <td className="px-6 py-4 font-bold text-gray-800">{fmt(item.stock * item.unitCost)}</td>
                  <td className="px-6 py-4 text-gray-500">{m?.totalPurchase || 0}</td>
                  <td className="px-6 py-4 text-gray-500">{m?.totalSales || 0}</td>
                  <td className="px-6 py-4 text-gray-500">{m?.openingStock || 0}</td>
                  <td className="px-6 py-4 text-gray-500 font-medium">{fmt(m?.purchaseValue || 0)}</td>
                  <td className="px-6 py-4 text-gray-500 font-medium">{fmt(m?.consumptionValue || 0)}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <button 
                        onClick={() => onDelete(item.id)}
                        className="w-8 h-8 flex items-center justify-center bg-[#FF4D4D] text-white rounded-lg hover:bg-red-600 transition-all hover:scale-110 shadow-sm"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button 
                        className="w-8 h-8 flex items-center justify-center bg-[#4ADE80] text-white rounded-lg hover:bg-green-500 transition-all hover:scale-110 shadow-sm"
                      >
                        <Edit2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f9fafb; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
      `}</style>
    </div>
  );
};
