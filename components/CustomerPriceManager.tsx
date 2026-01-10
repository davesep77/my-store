
import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Tag, User } from 'lucide-react';
import { CustomerPrice, Item, Customer } from '../types';
import { api } from '../services/api';

export const CustomerPriceManager: React.FC = () => {
    const [prices, setPrices] = useState<CustomerPrice[]>([]);
    const [items, setItems] = useState<Item[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingPrice, setEditingPrice] = useState<CustomerPrice | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [p, i, c] = await Promise.all([
                api.getCustomerPrices(),
                api.getItems(),
                api.getCustomers()
            ]);
            setPrices(p);
            setItems(i);
            setCustomers(c);
        } catch (e) {
            console.error(e);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this price rule?')) return;
        try {
            await api.deleteCustomerPrice(id);
            loadData();
        } catch (e) { alert('Failed to delete'); }
    };

    const filteredPrices = prices.filter(p =>
        (p.lastName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.company || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.itemName || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="h-full bg-slate-50 flex flex-col p-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Customer Pricing</h1>
                    <p className="text-slate-500 font-medium">Set special item prices for specific customers.</p>
                </div>
                <button
                    onClick={() => { setEditingPrice(null); setShowModal(true); }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-200 transition-all active:scale-95"
                >
                    <Plus size={20} /> Set New Price
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col flex-1 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search prices..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-blue-500 outline-none"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs tracking-wider sticky top-0">
                            <tr>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Item</th>
                                <th className="px-6 py-4 text-right">Regular Price</th>
                                <th className="px-6 py-4 text-right">Special Price</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredPrices.map(price => (
                                <tr key={price.id} className="hover:bg-slate-50 group">
                                    <td className="px-6 py-4 text-slate-800">
                                        <div className="font-bold flex items-center gap-2">
                                            <User size={16} className="text-slate-400" />
                                            {price.firstName} {price.lastName}
                                        </div>
                                        {price.company && <div className="text-xs text-slate-500 pl-6">{price.company}</div>}
                                    </td>
                                    <td className="px-6 py-4 text-slate-700 font-medium">
                                        {price.itemName}
                                        <div className="text-xs text-slate-400 font-mono">{price.sku}</div>
                                    </td>
                                    <td className="px-6 py-4 text-right text-slate-400 line-through">
                                        {new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(price.regularPrice || 0)}
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold text-green-600 text-lg">
                                        {new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(price.price)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => { setEditingPrice(price); setShowModal(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={18} /></button>
                                            <button onClick={() => handleDelete(price.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredPrices.length === 0 && <tr><td colSpan={5} className="p-10 text-center text-slate-400">No special prices defined.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <PriceFormModal
                    price={editingPrice}
                    items={items}
                    customers={customers}
                    onClose={() => setShowModal(false)}
                    onSave={() => { setShowModal(false); loadData(); }}
                />
            )}
        </div>
    );
};

interface PriceFormModalProps {
    price: CustomerPrice | null;
    items: Item[];
    customers: Customer[];
    onClose: () => void;
    onSave: () => void;
}

const PriceFormModal: React.FC<PriceFormModalProps> = ({ price, items, customers, onClose, onSave }) => {
    const [formData, setFormData] = useState<Partial<CustomerPrice>>({
        customerId: '', itemId: '', price: 0
    });

    useEffect(() => {
        if (price) {
            setFormData(price);
        }
    }, [price]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (price) await api.updateCustomerPrice(formData as CustomerPrice);
            else await api.createCustomerPrice(formData as CustomerPrice);
            onSave();
        } catch (e: any) { alert('Failed to save price. Error: ' + e.message); }
    };

    const selectedItem = items.find(i => i.id === formData.itemId);

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h2 className="text-xl font-bold text-slate-800">{price ? 'Edit Special Price' : 'Set Special Price'}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Customer</label>
                        <select
                            className="w-full p-3 border border-slate-200 rounded-lg bg-white"
                            value={formData.customerId}
                            onChange={e => setFormData({ ...formData, customerId: e.target.value })}
                            required
                            disabled={!!price} // Cannot change customer on edit
                        >
                            <option value="">Select Customer...</option>
                            {customers.map(c => (
                                <option key={c.id} value={c.id}>{c.firstName} {c.lastName} {c.company ? `(${c.company})` : ''}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Item</label>
                        <select
                            className="w-full p-3 border border-slate-200 rounded-lg bg-white"
                            value={formData.itemId}
                            onChange={e => setFormData({ ...formData, itemId: e.target.value })}
                            required
                            disabled={!!price} // Cannot change item on edit
                        >
                            <option value="">Select Item...</option>
                            {items.map(i => (
                                <option key={i.id} value={i.id}>{i.name} ({i.sku}) - Regular: £{i.price}</option>
                            ))}
                        </select>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <label className="block text-sm font-bold text-slate-700 mb-1">Special Price (£)</label>
                        <div className="flex items-center gap-4">
                            <input
                                type="number"
                                step="0.01"
                                className="flex-1 p-3 border border-slate-200 rounded-lg text-lg font-bold text-green-700"
                                value={formData.price}
                                onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                                required
                            />
                            {selectedItem && (
                                <div className="text-right">
                                    <div className="text-xs text-slate-400 font-bold uppercase">Savings</div>
                                    <div className="text-sm font-bold text-green-600">
                                        {formData.price && selectedItem.price ?
                                            `${Math.round((1 - (formData.price / selectedItem.price)) * 100)}%` :
                                            '0%'}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 gap-3">
                        <button type="button" onClick={onClose} className="px-6 py-3 text-slate-500 font-bold hover:bg-slate-100 rounded-lg">Cancel</button>
                        <button type="submit" className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-200">Save Price</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
