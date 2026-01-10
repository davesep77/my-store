
import React, { useState, useEffect } from 'react';
import { X, Edit2, Plus } from 'lucide-react';
import { Item } from '../types';

interface ItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    initialData?: Item | null;
    title?: string;
}

export const ItemModal: React.FC<ItemModalProps> = ({ isOpen, onClose, onSubmit, initialData, title }) => {
    const [formData, setFormData] = useState({
        sku: '',
        name: '',
        stock: '',
        unitCost: '',
        sellingPrice: '',
        stockAlertLevel: '5',
        remarks: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                sku: initialData.sku,
                name: initialData.name,
                stock: initialData.stock.toString(),
                unitCost: initialData.unitCost.toString(),
                sellingPrice: initialData.sellingPrice.toString(),
                stockAlertLevel: (initialData.stockAlertLevel || 5).toString(),
                remarks: initialData.remarks || ''
            });
        } else {
            setFormData({ sku: '', name: '', stock: '', unitCost: '', sellingPrice: '', stockAlertLevel: '5', remarks: '' });
        }
    }, [initialData, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const data = {
            sku: formData.sku || `SKU-${Math.floor(Math.random() * 1000)}`,
            name: formData.name,
            stock: Number(formData.stock),
            unitCost: Number(formData.unitCost),
            sellingPrice: Number(formData.sellingPrice),
            stockAlertLevel: Number(formData.stockAlertLevel),
            remarks: formData.remarks,
            dateAdded: initialData ? initialData.dateAdded : new Date().toISOString().split('T')[0]
        };
        onSubmit(data);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
                <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl text-white ${initialData ? 'bg-green-500' : 'bg-purple-500'}`}>
                            {initialData ? <Edit2 size={24} /> : <Plus size={24} />}
                        </div>
                        <h3 className="text-2xl font-black text-gray-800 tracking-tight">
                            {title || (initialData ? 'Edit Product Entry' : 'Add New Inventory')}
                        </h3>
                    </div>
                    <button onClick={onClose} className="p-2.5 text-gray-400 hover:text-gray-600 rounded-2xl hover:bg-gray-100 transition-all active:scale-90">
                        <X size={28} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Product Name</label>
                            <input
                                required
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-purple-500 focus:bg-white outline-none transition-all text-gray-800 font-bold placeholder:font-normal placeholder:opacity-40"
                                placeholder="e.g. SSD 1TB NVMe Samsung"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">SKU / Model Code</label>
                            <input
                                type="text"
                                value={formData.sku}
                                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-purple-500 focus:bg-white outline-none transition-all font-mono"
                                placeholder="Leave empty for auto"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Alert Level (Low Stock)</label>
                            <input
                                type="number"
                                value={formData.stockAlertLevel}
                                onChange={(e) => setFormData({ ...formData, stockAlertLevel: e.target.value })}
                                className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-purple-500 focus:bg-white outline-none transition-all font-bold"
                            />
                        </div>

                        <div className="md:col-span-2 grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Quantity</label>
                                <input
                                    required
                                    type="number"
                                    value={formData.stock}
                                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                    className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-purple-500 focus:bg-white outline-none transition-all font-bold"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Unit Cost</label>
                                <input
                                    required
                                    type="number"
                                    value={formData.unitCost}
                                    onChange={(e) => setFormData({ ...formData, unitCost: e.target.value })}
                                    className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-purple-500 focus:bg-white outline-none transition-all font-bold"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Selling Price</label>
                                <input
                                    required
                                    type="number"
                                    value={formData.sellingPrice}
                                    onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                                    className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-purple-500 focus:bg-white outline-none transition-all font-bold"
                                />
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Remarks & Descriptions</label>
                            <textarea
                                value={formData.remarks}
                                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                                className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-purple-500 focus:bg-white outline-none transition-all h-28 resize-none font-medium text-gray-600"
                                placeholder="Enter features, warranty info, or batch details..."
                            />
                        </div>
                    </div>

                    <div className="pt-6 flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-8 py-4.5 bg-gray-100 text-gray-600 rounded-[1.5rem] font-bold hover:bg-gray-200 transition-all active:scale-95"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-[2] bg-[#8E54E9] text-white py-4.5 rounded-[1.5rem] font-bold hover:bg-[#7c47d3] transition-all shadow-2xl shadow-purple-200 active:scale-95"
                        >
                            {initialData ? 'Save Updated Changes' : 'Confirm & Add to Stock'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
