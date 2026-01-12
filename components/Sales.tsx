import React, { useState, useMemo } from 'react';
import { Item, Transaction, UserSettings } from '../types';
import { Search, X, Trash2, Plus, Calendar, ShoppingCart, ChevronRight, Edit2, Package, AlertTriangle } from 'lucide-react';

interface SalesProps {
  items: Item[];
  transactions: Transaction[];
  onAddTransaction: (t: Omit<Transaction, 'id'>) => void;
  onDeleteTransaction: (id: string) => void;
  settings: UserSettings;
}

export const Sales: React.FC<SalesProps> = ({ items, transactions, onAddTransaction, onDeleteTransaction, settings }) => {
  const [view, setView] = useState<'list' | 'add' | 'edit'>('list');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteBatchId, setDeleteBatchId] = useState<string | null>(null);
  const [editingBatchId, setEditingBatchId] = useState<string | null>(null);

  // Form State
  const [entries, setEntries] = useState<{ itemId: string, quantity: number, price: number }[]>([
    { itemId: '', quantity: 1, price: 0 }
  ]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const fmt = (val: number) => new Intl.NumberFormat(settings.locale, {
    style: 'currency',
    currency: settings.currency
  }).format(val);

  // Group transactions by batchId
  const salesBatches = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    transactions
      .filter(t => t.type === 'sale')
      .forEach(t => {
        const batchId = t.batchId || t.id;
        if (!groups[batchId]) groups[batchId] = [];
        groups[batchId].push(t);
      });

    return Object.entries(groups).map(([batchId, batchItems]) => ({
      id: batchId,
      date: batchItems[0].date,
      totalQuantity: batchItems.reduce((sum, i) => sum + i.quantity, 0),
      totalAmount: batchItems.reduce((sum, i) => sum + (i.quantity * i.unitPrice), 0),
      items: batchItems
    })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions]);

  const addRow = () => setEntries([...entries, { itemId: '', quantity: 1, price: 0 }]);
  const removeRow = (idx: number) => setEntries(entries.filter((_, i) => i !== idx));

  const updateEntry = (idx: number, field: string, value: any) => {
    const newEntries = [...entries];
    // @ts-ignore
    newEntries[idx] = { ...newEntries[idx], [field]: value };
    if (field === 'itemId') {
      const item = items.find(i => i.id === value);
      if (item) newEntries[idx].price = item.sellingPrice;
    }
    setEntries(newEntries);
  };

  const handleOpenEdit = (batch: any) => {
    setEditingBatchId(batch.id);
    setDate(batch.date);
    setEntries(batch.items.map((t: Transaction) => ({
      itemId: t.itemId,
      quantity: t.quantity,
      price: t.unitPrice
    })));
    setView('edit');
  };

  const handleDeleteBatch = () => {
    if (!deleteBatchId) return;
    const batch = salesBatches.find(b => b.id === deleteBatchId);
    if (batch) {
      batch.items.forEach((t: Transaction) => onDeleteTransaction(t.id));
    }
    setDeleteBatchId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // If editing, we delete the old batch first to revert stock correctly, then re-add
      if (view === 'edit' && editingBatchId) {
        const oldBatch = salesBatches.find(b => b.id === editingBatchId);
        if (oldBatch) {
          for (const t of oldBatch.items) {
            await onDeleteTransaction(t.id);
          }
        }
      }

      const batchId = `sale-${Date.now()}`;

      // Process all transactions sequentially to ensure proper stock updates
      for (const entry of entries) {
        if (entry.itemId && entry.quantity > 0) {
          await onAddTransaction({
            batchId,
            date,
            type: 'sale',
            itemId: entry.itemId,
            quantity: entry.quantity,
            unitPrice: entry.price,
            remarks: 'Standard Sale'
          });
        }
      }

      // Only reset form and close if all transactions succeeded
      setEntries([{ itemId: '', quantity: 1, price: 0 }]);
      setView('list');
      setEditingBatchId(null);
    } catch (err: any) {
      console.error('Failed to save sale:', err);
      // Error already shown by addTransaction, form stays open for user to fix
    }
  };

  const handleOpenAdd = () => {
    setEditingBatchId(null);
    setEntries([{ itemId: '', quantity: 1, price: 0 }]);
    setDate(new Date().toISOString().split('T')[0]);
    setView('add');
  };

  if (view === 'add' || view === 'edit') {
    return (
      <div className="max-w-4xl mx-auto animate-scale-in">
        <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl shadow-purple-200/50 border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-50 to-transparent rounded-full blur-3xl opacity-50" />
          <div className="flex justify-between items-center mb-10">
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 p-3 rounded-2xl">
                <ShoppingCart className="text-[#8E54E9]" size={28} />
              </div>
              <div>
                <h2 className="text-3xl font-black text-gray-800 tracking-tight">
                  {view === 'edit' ? 'Edit Sale' : 'New Sale'}
                </h2>
                <p className="text-gray-400 font-medium">
                  {view === 'edit' ? 'Update existing transaction details.' : 'Record a new customer transaction.'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setView('list')}
              className="p-3 text-gray-400 hover:text-gray-600 rounded-2xl hover:bg-gray-50 transition-all"
            >
              <X size={32} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="max-w-xs">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Transaction Date</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-purple-200 rounded-2xl font-bold text-gray-700 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-4">
              {entries.map((entry, idx) => (
                <div key={idx} className="flex flex-col md:flex-row gap-4 p-6 bg-gray-50/50 rounded-3xl border border-gray-100 relative group transition-all hover:bg-white hover:shadow-lg">
                  <div className="flex-1">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Select Product</label>
                    <select
                      required
                      value={entry.itemId}
                      onChange={(e) => updateEntry(idx, 'itemId', e.target.value)}
                      className="w-full bg-white border-2 border-gray-100 rounded-xl py-3.5 px-4 text-sm focus:border-[#8E54E9] font-bold outline-none transition-all"
                    >
                      <option value="">Choose...</option>
                      {items.map((item: Item) => (
                        <option key={item.id} value={item.id}>{item.name} (Stock: {item.stock})</option>
                      ))}
                    </select>
                  </div>
                  <div className="w-full md:w-32">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={entry.quantity}
                      onChange={(e) => updateEntry(idx, 'quantity', Number(e.target.value))}
                      className="w-full bg-white border-2 border-gray-100 rounded-xl py-3.5 px-4 text-sm focus:border-[#8E54E9] font-bold outline-none transition-all"
                    />
                  </div>
                  <div className="w-full md:w-40">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Price / Unit</label>
                    <input
                      type="number"
                      value={entry.price}
                      onChange={(e) => updateEntry(idx, 'price', Number(e.target.value))}
                      className="w-full bg-white border-2 border-gray-100 rounded-xl py-3.5 px-4 text-sm focus:border-[#8E54E9] font-bold outline-none transition-all"
                    />
                  </div>
                  <div className="flex items-end pb-1">
                    <button
                      type="button"
                      onClick={() => removeRow(idx)}
                      className="p-3.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-8 border-t pt-10 mt-10">
              <button
                type="button"
                onClick={addRow}
                className="flex items-center text-sm font-black text-[#8E54E9] hover:bg-purple-50 px-8 py-4 rounded-2xl transition-all active:scale-95 border-2 border-purple-100"
              >
                <Plus size={20} className="mr-2" />
                Add Line Item
              </button>
              <div className="flex items-center gap-10">
                <div className="text-right">
                  <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest block mb-1">Grand Total</span>
                  <p className="text-4xl font-black text-gray-800">
                    {fmt(entries.reduce((acc, e) => acc + (e.quantity * e.price), 0))}
                  </p>
                </div>
                <button type="submit" className="bg-[#8E54E9] text-white px-10 py-5 rounded-[1.5rem] font-black text-lg shadow-xl shadow-purple-200 hover:bg-[#7c47d3] transition-all active:scale-95">
                  {view === 'edit' ? 'Update Sale' : 'Save Sale'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-slide-up">
      <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden min-h-[500px]">
        {/* Table Header matching screenshot */}
        <div className="p-8 pb-4 flex items-center justify-start gap-4 bg-gradient-to-r from-white to-purple-50/20">
          <h2 className="text-3xl font-black text-gray-800 tracking-tight font-display">Sales</h2>
          <button
            onClick={handleOpenAdd}
            className="bg-gradient-to-r from-[#8E54E9] to-[#7B47D4] text-white px-6 py-2.5 rounded-xl text-xs font-black flex items-center gap-1.5 hover:shadow-xl hover:shadow-purple-300/50 transition-all active:scale-95 hover:scale-105"
          >
            <Plus size={14} strokeWidth={4} />
            Add New
          </button>
        </div>

        <div className="overflow-x-auto p-2">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="text-gray-900 font-bold text-[13px]">
              <tr className="border-b border-gray-100">
                <th className="px-8 py-6 w-12 text-center"></th>
                <th className="px-6 py-6 text-center">ID</th>
                <th className="px-6 py-6 text-center">Date</th>
                <th className="px-6 py-6 text-center">Total Quantity</th>
                <th className="px-6 py-6 text-center">Total Amount</th>
                <th className="px-10 py-6 text-right w-40"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {salesBatches.map((batch, index) => {
                const displayId = salesBatches.length - index + 61;

                return (
                  <React.Fragment key={batch.id}>
                    <tr
                      className={`hover:bg-purple-50/10 transition-all group cursor-pointer ${expandedId === batch.id ? 'bg-purple-50/20' : ''}`}
                      onClick={() => setExpandedId(expandedId === batch.id ? null : batch.id)}
                    >
                      <td className="px-8 py-6">
                        <div className={`transition-all duration-300 text-gray-400 group-hover:text-[#8E54E9] ${expandedId === batch.id ? 'rotate-90 text-[#8E54E9]' : ''}`}>
                          <ChevronRight size={18} strokeWidth={2.5} />
                        </div>
                      </td>
                      <td className="px-6 py-6 text-center text-gray-500 font-bold">
                        {displayId}
                      </td>
                      <td className="px-6 py-6 text-center text-gray-500 font-bold">
                        {new Date(batch.date).toLocaleDateString(settings.locale)}
                      </td>
                      <td className="px-6 py-6 text-center text-gray-800 font-bold">
                        {batch.totalQuantity}
                      </td>
                      <td className="px-6 py-6 text-center text-gray-900 font-black">
                        {fmt(batch.totalAmount)}
                      </td>
                      <td className="px-10 py-6">
                        <div className="flex justify-end items-center gap-3" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setDeleteBatchId(batch.id)}
                            className="w-10 h-10 flex items-center justify-center bg-[#FF4D4D] text-white rounded-xl hover:bg-red-600 transition-all shadow-sm active:scale-90"
                          >
                            <Trash2 size={20} strokeWidth={2.5} />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(batch)}
                            className="w-10 h-10 flex items-center justify-center bg-[#4ADE80] text-white rounded-xl hover:bg-green-500 transition-all shadow-sm active:scale-90"
                          >
                            <Edit2 size={20} strokeWidth={2.5} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedId === batch.id && (
                      <tr className="bg-gray-50/40">
                        <td colSpan={6} className="px-16 py-8 border-b border-gray-100">
                          <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
                            <div className="flex items-center gap-2 mb-6">
                              <Package className="text-[#8E54E9]" size={18} />
                              <h4 className="text-[11px] font-black text-[#8E54E9] uppercase tracking-widest">Sale Itemization</h4>
                            </div>
                            <table className="w-full text-xs">
                              <thead className="text-[10px] text-gray-400 font-black uppercase tracking-widest border-b border-gray-50">
                                <tr>
                                  <th className="pb-4 text-left">Product Name</th>
                                  <th className="pb-4 text-center">Qty</th>
                                  <th className="pb-4 text-right">Unit Price</th>
                                  <th className="pb-4 text-right">Line Total</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-50">
                                {batch.items.map((t: Transaction) => {
                                  const item = items.find(i => i.id === t.itemId);
                                  return (
                                    <tr key={t.id} className="text-gray-600">
                                      <td className="py-4 font-bold text-gray-800">{item?.name || 'Unknown Product'}</td>
                                      <td className="py-4 text-center font-bold">{t.quantity}</td>
                                      <td className="py-4 text-right">{fmt(t.unitPrice)}</td>
                                      <td className="py-4 text-right font-black text-gray-900">{fmt(t.quantity * t.unitPrice)}</td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteBatchId && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-md w-full animate-in zoom-in-95 duration-300 shadow-2xl">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-6 border-4 border-red-50/50">
                <AlertTriangle size={40} />
              </div>
              <h3 className="text-2xl font-black text-gray-800 mb-3 tracking-tight">Void this Sale?</h3>
              <p className="text-gray-500 font-medium leading-relaxed mb-8">
                Deleting this record will restore the original stock levels for all products in this transaction. This action cannot be undone.
              </p>
              <div className="flex gap-4 w-full">
                <button
                  onClick={() => setDeleteBatchId(null)}
                  className="flex-1 px-6 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all active:scale-95"
                >
                  No, Cancel
                </button>
                <button
                  onClick={handleDeleteBatch}
                  className="flex-1 px-6 py-4 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 transition-all shadow-xl shadow-red-200 active:scale-95"
                >
                  Yes, Void Sale
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
