import React, { useState } from 'react';
import { Plus, Edit2, Trash2, ChevronRight, Search, AlertTriangle } from 'lucide-react';
import { Item, UserSettings } from '../types';
import { ItemModal } from './ItemModal';

interface NewStocksProps {
  items: Item[];
  onAdd: (item: Omit<Item, 'id'>) => void;
  onUpdate: (item: Item) => void;
  onDelete: (id: string) => void;
  settings: UserSettings;
}

export const NewStocks: React.FC<NewStocksProps> = ({ items, onAdd, onUpdate, onDelete, settings }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const handleOpenAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: Item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleSubmit = (data: any) => {
    if (editingItem) {
      onUpdate({ ...data, id: editingItem.id });
    } else {
      onAdd(data);
    }
    setIsModalOpen(false);
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.sku.toLowerCase().includes(search.toLowerCase())
  ).slice().reverse();

  const fmt = (val: number) => {
    return new Intl.NumberFormat(settings.locale, {
      style: 'currency',
      currency: settings.currency,
    }).format(val);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
        <div>
          <h2 className="text-3xl font-black text-gray-800 tracking-tight">Stocks In</h2>
          <p className="text-gray-500 font-medium">Manage your incoming inventory and alerts.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-[#8E54E9] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-[#7c47d3] transition-all hover:scale-105 active:scale-95 shadow-xl shadow-purple-200"
        >
          <Plus size={20} />
          Add New Entry
        </button>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden min-h-[500px]">
        <div className="p-6 border-b border-gray-100 bg-gray-50/30 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search entry log..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border-transparent border focus:border-purple-300 rounded-2xl text-sm focus:ring-4 focus:ring-purple-50 transition-all outline-none shadow-sm"
            />
          </div>
          <div className="text-sm font-bold text-gray-400">
            {filteredItems.length} Total Logs
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[1000px]">
            <thead className="text-gray-400 font-black uppercase tracking-widest text-[10px] bg-gray-50/50">
              <tr className="border-b">
                <th className="px-8 py-5 w-12 text-center"></th>
                <th className="px-6 py-5">ID</th>
                <th className="px-6 py-5">Date</th>
                <th className="px-6 py-5">Product Name</th>
                <th className="px-6 py-5 text-center">Qty</th>
                <th className="px-6 py-5">Unit Cost</th>
                <th className="px-6 py-5">Selling Price</th>
                <th className="px-6 py-5 text-center">Stock Alert</th>
                <th className="px-6 py-5">Remarks</th>
                <th className="px-8 py-5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/80 transition-all group cursor-default">
                  <td className="px-8 py-5 text-gray-300">
                    <ChevronRight size={18} className="group-hover:text-[#8E54E9] transition-all transform group-hover:translate-x-1" />
                  </td>
                  <td className="px-6 py-5 text-gray-400 font-mono text-xs">#{item.id}</td>
                  <td className="px-6 py-5 text-gray-500 font-medium">{item.dateAdded}</td>
                  <td className="px-6 py-5">
                    <div className="font-bold text-gray-800 text-base">{item.name}</div>
                    <div className="text-[10px] text-gray-400 uppercase font-black tracking-widest">{item.sku}</div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className={`inline-block px-3 py-1 rounded-xl text-xs font-black shadow-sm ${item.stock <= (item.stockAlertLevel || 0) ? 'bg-red-50 text-red-500 border border-red-100' : 'bg-green-50 text-green-500 border border-green-100'}`}>
                      {item.stock}
                    </span>
                  </td>
                  <td className="px-6 py-5 font-bold text-gray-700">{fmt(item.unitCost)}</td>
                  <td className="px-6 py-5 font-bold text-gray-700">{fmt(item.sellingPrice)}</td>
                  <td className="px-6 py-5 text-center text-gray-500 font-bold">{item.stockAlertLevel || 5}</td>
                  <td className="px-6 py-5 text-gray-500 italic max-w-[200px] truncate">{item.remarks || <span className="opacity-30">N/A</span>}</td>
                  <td className="px-8 py-5">
                    <div className="flex justify-center items-center gap-3">
                      <button
                        onClick={() => setDeleteId(item.id)}
                        className="w-10 h-10 flex items-center justify-center bg-[#FF4D4D] text-white rounded-xl hover:bg-red-600 transition-all hover:scale-110 active:scale-90 shadow-lg shadow-red-200 group/btn"
                        title="Delete Entry"
                      >
                        <Trash2 size={18} className="transition-transform group-hover/btn:rotate-12" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="w-10 h-10 flex items-center justify-center bg-[#4ADE80] text-white rounded-xl hover:bg-green-500 transition-all hover:scale-110 active:scale-90 shadow-lg shadow-green-200 group/btn"
                        title="Edit Entry"
                      >
                        <Edit2 size={18} className="transition-transform group-hover/btn:-rotate-12" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-20 text-center">
                    <div className="flex flex-col items-center opacity-20">
                      <Search size={48} />
                      <p className="mt-4 font-bold text-xl">No entries found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-md w-full animate-in zoom-in-95 duration-300 shadow-2xl">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-6 border-4 border-red-50/50">
                <AlertTriangle size={40} />
              </div>
              <h3 className="text-2xl font-black text-gray-800 mb-3 tracking-tight">Are you sure?</h3>
              <p className="text-gray-500 font-medium leading-relaxed mb-8">
                Deleting this record will affect your current stock totals and cannot be undone. Do you want to continue?
              </p>
              <div className="flex gap-4 w-full">
                <button
                  onClick={() => setDeleteId(null)}
                  className="flex-1 px-6 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all active:scale-95"
                >
                  No, Cancel
                </button>
                <button
                  onClick={() => {
                    onDelete(deleteId);
                    setDeleteId(null);
                  }}
                  className="flex-1 px-6 py-4 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 transition-all shadow-xl shadow-red-200 active:scale-95"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingItem}
      />
    </div>
  );
};
