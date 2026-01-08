
import React, { useState, useMemo } from 'react';
import { Calendar, ChevronDown, X, FileText, Trash2, ChevronRight, Package, AlertTriangle, FileSpreadsheet } from 'lucide-react';
import { Item, Transaction, UserSettings } from '../types';
import * as XLSX from 'xlsx';

interface ReportsProps {
  items: Item[];
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
  settings: UserSettings;
}

export const Reports: React.FC<ReportsProps> = ({ items, transactions, onDeleteTransaction, settings }) => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [types, setTypes] = useState({
    purchase: true,
    sale: true,
    opening: true
  });
  
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const clearFilters = () => {
    setFromDate('');
    setToDate('');
    setSelectedProductId('');
    setTypes({ purchase: true, sale: true, opening: true });
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      if (t.type === 'purchase' && !types.purchase) return false;
      if (t.type === 'sale' && !types.sale) return false;
      if (t.type === 'opening' && !types.opening) return false;
      if (selectedProductId && t.itemId !== selectedProductId) return false;
      if (fromDate && new Date(t.date) < new Date(fromDate)) return false;
      if (toDate && new Date(t.date) > new Date(toDate)) return false;
      return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, types, selectedProductId, fromDate, toDate]);

  const fmt = (val: number) => new Intl.NumberFormat(settings.locale, { 
    style: 'currency', 
    currency: settings.currency 
  }).format(val);

  const handleExportExcel = () => {
    // Transform data for Excel
    const data = filteredTransactions.map(t => {
      const item = items.find(i => i.id === t.itemId);
      return {
        'Date': new Date(t.date).toLocaleDateString(settings.locale),
        'Product': item?.name || 'Unknown',
        'SKU': item?.sku || '',
        'Quantity': t.quantity,
        'Unit Price': t.unitPrice,
        'Total Value': t.quantity * t.unitPrice,
        'Remarks': t.remarks || '',
        'Type': t.type === 'sale' ? 'Consumption' : t.type.charAt(0).toUpperCase() + t.type.slice(1)
      };
    });

    // Create workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory Report");
    
    // Auto-size columns
    const wscols = [
      { wch: 12 }, // Date
      { wch: 25 }, // Product
      { wch: 12 }, // SKU
      { wch: 10 }, // Qty
      { wch: 15 }, // Unit Price
      { wch: 15 }, // Total
      { wch: 30 }, // Remarks
      { wch: 15 }  // Type
    ];
    worksheet['!cols'] = wscols;

    // Trigger download
    XLSX.writeFile(workbook, `Inventory_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  const handleDelete = () => {
    if (deleteId) {
      onDeleteTransaction(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden print:border-none print:shadow-none">
        
        {/* PDF Print-Only Header */}
        <div className="print-header hidden print:block">
           <h1 className="text-3xl font-black mb-2">My Store Inventory Report</h1>
           <p className="text-gray-500">Generated on: {new Date().toLocaleDateString(settings.locale)}</p>
           {(fromDate || toDate) && (
             <p className="mt-2 font-medium text-gray-400">Filtering period: {fromDate || 'Start'} — {toDate || 'Present'}</p>
           )}
        </div>

        {/* Interactive Filters: HIDE ON PRINT */}
        <div className="p-10 pb-6 no-print">
          <h2 className="text-3xl font-black text-gray-800 tracking-tight mb-8">Report</h2>
          
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="relative group">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#8E54E9] transition-colors" size={14} />
                  <input 
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold text-gray-600 outline-none focus:ring-2 focus:ring-purple-100 transition-all w-40"
                    title="From Date"
                  />
                </div>
                <div className="relative group">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#8E54E9] transition-colors" size={14} />
                  <input 
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold text-gray-600 outline-none focus:ring-2 focus:ring-purple-100 transition-all w-40"
                    title="To Date"
                  />
                </div>
              </div>

              <div className="relative group">
                <select 
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold text-gray-500 outline-none focus:ring-2 focus:ring-purple-100 transition-all min-w-[200px]"
                >
                  <option value="">All Products</option>
                  {items.map(item => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
              </div>

              <div className="flex flex-1 justify-end items-center gap-3">
                <button 
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-4 py-2.5 bg-yellow-400/10 text-yellow-700 rounded-lg hover:bg-yellow-400/20 text-[11px] font-black transition-all active:scale-95"
                >
                  <X size={14} strokeWidth={3} />
                  Clear Filters
                </button>
                <button 
                  onClick={handlePrintPDF}
                  className="px-5 py-2.5 bg-[#8E54E9] text-white rounded-lg text-[11px] font-black hover:bg-[#7c47d3] transition-all active:scale-95 shadow-lg shadow-purple-100 flex items-center gap-2"
                >
                  <FileText size={14} strokeWidth={3} />
                  PDF
                </button>
                <button 
                  onClick={handleExportExcel}
                  className="px-5 py-2.5 bg-[#4ADE80] text-white rounded-lg text-[11px] font-black hover:bg-green-500 transition-all active:scale-95 shadow-lg shadow-green-100 flex items-center gap-2 border border-green-200"
                >
                  <FileSpreadsheet size={14} strokeWidth={3} />
                  Download Excel File
                </button>
              </div>
            </div>

            <div className="flex items-center gap-8 pt-2">
              {(['purchase', 'sale', 'opening'] as const).map((type) => (
                <label key={type} className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input 
                      type="checkbox" 
                      checked={types[type]}
                      onChange={(e) => setTypes({...types, [type]: e.target.checked})}
                      className="peer hidden"
                    />
                    <div className="w-5 h-5 rounded-md border-2 border-gray-200 peer-checked:border-[#8E54E9] peer-checked:bg-[#8E54E9] transition-all flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-sm opacity-0 peer-checked:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  <span className="text-sm font-bold text-gray-500 group-hover:text-gray-700 transition-colors uppercase tracking-tight">
                    {type === 'sale' ? 'Consumption' : type}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="text-gray-900 font-black text-xs border-b border-gray-50 uppercase tracking-tight bg-gray-50/50">
              <tr>
                <th className="px-8 py-6 no-print w-10"></th>
                <th className="px-10 py-6">Date</th>
                <th className="px-6 py-6">Product</th>
                <th className="px-6 py-6 text-center">Quantity</th>
                <th className="px-6 py-6 text-right">Unit Price</th>
                <th className="px-6 py-6 text-right">Total Value</th>
                <th className="px-6 py-6">Remarks</th>
                <th className="px-10 py-6 text-right">Type</th>
                <th className="px-6 py-6 no-print text-center w-20">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50/50">
              {filteredTransactions.map((t) => {
                const item = items.find(i => i.id === t.itemId);
                return (
                  <React.Fragment key={t.id}>
                    <tr 
                      className={`hover:bg-purple-50/5 transition-all group cursor-pointer ${expandedId === t.id ? 'bg-purple-50/10' : ''}`}
                      onClick={() => setExpandedId(expandedId === t.id ? null : t.id)}
                    >
                      <td className="px-8 py-5 no-print">
                        <ChevronRight 
                          size={16} 
                          className={`text-gray-300 transition-transform ${expandedId === t.id ? 'rotate-90 text-[#8E54E9]' : 'group-hover:translate-x-1'}`} 
                        />
                      </td>
                      <td className="px-10 py-5 text-gray-500 font-bold whitespace-nowrap">
                        {new Date(t.date).toLocaleDateString(settings.locale)}
                      </td>
                      <td className="px-6 py-5">
                        <div className="font-bold text-gray-800">{item?.name || 'Deleted Product'}</div>
                        <div className="text-[10px] text-gray-400 font-black uppercase no-print tracking-wider">{item?.sku || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-5 text-center font-black text-gray-700">
                        {t.quantity}
                      </td>
                      <td className="px-6 py-5 text-right font-bold text-gray-500">
                        {fmt(t.unitPrice)}
                      </td>
                      <td className="px-6 py-5 text-right font-black text-gray-900">
                        {fmt(t.quantity * t.unitPrice)}
                      </td>
                      <td className="px-6 py-5 text-gray-400 font-medium italic truncate max-w-[180px]">
                        {t.remarks || '-'}
                      </td>
                      <td className="px-10 py-5 text-right">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md shadow-sm border ${
                          t.type === 'sale' ? 'text-red-600 bg-red-50 border-red-100' : 
                          t.type === 'purchase' ? 'text-green-600 bg-green-50 border-green-100' : 
                          'text-blue-600 bg-blue-50 border-blue-100'
                        }`}>
                          {t.type === 'sale' ? 'Consumption' : t.type}
                        </span>
                      </td>
                      <td className="px-6 py-5 no-print text-center">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setDeleteId(t.id); }}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all active:scale-90"
                          title="Void Transaction"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                    {expandedId === t.id && (
                      <tr className="bg-gray-50/40 no-print">
                        <td colSpan={9} className="px-20 py-8">
                          <div className="bg-white rounded-2xl p-6 border border-purple-100 shadow-lg animate-in slide-in-from-top-2">
                             <div className="flex items-center gap-3 mb-6">
                               <Package className="text-[#8E54E9]" size={18} />
                               <h4 className="text-xs font-black text-[#8E54E9] uppercase tracking-widest">Transaction Itemization</h4>
                             </div>
                             <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                               <div className="space-y-1">
                                 <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">SKU Information</p>
                                 <p className="font-bold text-gray-700">{item?.sku || 'Not Available'}</p>
                               </div>
                               <div className="space-y-1">
                                 <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Inventory Delta</p>
                                 <p className={`font-black ${t.type === 'sale' ? 'text-red-500' : 'text-green-500'}`}>
                                   {t.type === 'sale' ? '-' : '+'}{t.quantity} units
                                 </p>
                               </div>
                               <div className="space-y-1">
                                 <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Transaction Audit ID</p>
                                 <p className="font-mono text-xs text-gray-400 break-all">{t.id}</p>
                               </div>
                               <div className="space-y-1">
                                 <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Full Narrative</p>
                                 <p className="text-gray-600 italic text-sm leading-relaxed">{t.remarks || 'No extended remarks provided for this record.'}</p>
                               </div>
                             </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-48 text-center">
                    <div className="flex flex-col items-center opacity-10">
                      <FileText size={100} strokeWidth={1} />
                      <p className="mt-6 font-black text-2xl tracking-tight">Zero Transactions Found</p>
                      <p className="text-sm font-medium mt-1">Adjust your filters to see more data.</p>
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
          <div className="bg-white rounded-[3rem] p-12 max-w-md w-full animate-in zoom-in-95 duration-300 shadow-2xl relative">
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-8 border-4 border-red-50/50">
                <AlertTriangle size={48} />
              </div>
              <h3 className="text-3xl font-black text-gray-800 mb-4 tracking-tight">Void Record?</h3>
              <p className="text-gray-500 font-medium leading-relaxed mb-10 px-4">
                This transaction will be completely removed from the report and your stock levels will be automatically reverted. This process is final.
              </p>
              <div className="flex gap-4 w-full">
                <button 
                  onClick={() => setDeleteId(null)}
                  className="flex-1 px-8 py-5 bg-gray-100 text-gray-600 rounded-3xl font-bold hover:bg-gray-200 transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDelete}
                  className="flex-1 px-8 py-5 bg-red-500 text-white rounded-3xl font-bold hover:bg-red-600 transition-all shadow-2xl shadow-red-200 active:scale-95"
                >
                  Yes, Void
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
