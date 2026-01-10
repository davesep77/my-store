
import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, ClipboardList, CheckCircle, Clock, XCircle } from 'lucide-react';
import { BackOrder, Item, Customer } from '../types';
import { api } from '../services/api';

export const BackOrderManagement: React.FC = () => {
    const [backOrders, setBackOrders] = useState<BackOrder[]>([]);
    const [items, setItems] = useState<Item[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingOrder, setEditingOrder] = useState<BackOrder | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [bo, i, c] = await Promise.all([
                api.getBackOrders(),
                api.getItems(),
                api.getCustomers()
            ]);
            setBackOrders(bo);
            setItems(i);
            setCustomers(c);
        } catch (e) {
            console.error(e);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this back order?')) return;
        try {
            await api.deleteBackOrder(id);
            loadData();
        } catch (e) { alert('Failed to delete'); }
    };

    const filteredOrders = backOrders.filter(bo =>
        (bo.itemName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (bo.firstName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (bo.lastName || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="h-full bg-slate-50 flex flex-col p-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Back Orders</h1>
                    <p className="text-slate-500 font-medium">Track and fulfill out-of-stock requests.</p>
                </div>
                <button
                    onClick={() => { setEditingOrder(null); setShowModal(true); }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-200 transition-all active:scale-95"
                >
                    <Plus size={20} /> New Back Order
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col flex-1 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search orders..."
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
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Item Needed</th>
                                <th className="px-6 py-4 text-center">Qty</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredOrders.map(Order => (
                                <tr key={Order.id} className="hover:bg-slate-50 group">
                                    <td className="px-6 py-4 text-slate-600 font-medium whitespace-nowrap">
                                        {new Date(Order.orderDate).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 font-bold text-slate-800">
                                        {Order.firstName} {Order.lastName}
                                        {Order.company && <div className="text-xs text-slate-400 font-normal">{Order.company}</div>}
                                    </td>
                                    <td className="px-6 py-4 text-slate-700">
                                        <div className="font-bold">{Order.itemName}</div>
                                        <div className="text-xs text-slate-400 font-mono">{Order.sku}</div>
                                    </td>
                                    <td className="px-6 py-4 text-center font-bold text-slate-800">
                                        {Order.quantity}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase ${Order.status === 'fulfilled' ? 'bg-green-100 text-green-700' :
                                                Order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {Order.status === 'fulfilled' ? <CheckCircle size={14} /> :
                                                Order.status === 'cancelled' ? <XCircle size={14} /> : <Clock size={14} />}
                                            {Order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => { setEditingOrder(Order); setShowModal(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={18} /></button>
                                            <button onClick={() => handleDelete(Order.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredOrders.length === 0 && <tr><td colSpan={6} className="p-10 text-center text-slate-400">No back orders found.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <BackOrderFormModal
                    order={editingOrder}
                    items={items}
                    customers={customers}
                    onClose={() => setShowModal(false)}
                    onSave={() => { setShowModal(false); loadData(); }}
                />
            )}
        </div>
    );
};

interface BackOrderFormModalProps {
    order: BackOrder | null;
    items: Item[];
    customers: Customer[];
    onClose: () => void;
    onSave: () => void;
}

const BackOrderFormModal: React.FC<BackOrderFormModalProps> = ({ order, items, customers, onClose, onSave }) => {
    const [formData, setFormData] = useState<Partial<BackOrder>>({
        id: '',
        customerId: '',
        itemId: '',
        quantity: 1,
        orderDate: new Date().toISOString().split('T')[0],
        status: 'pending'
    });

    useEffect(() => {
        if (order) {
            setFormData(order);
        }
    }, [order]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (order) await api.updateBackOrder(formData as BackOrder);
            else await api.createBackOrder(formData as BackOrder);
            onSave();
        } catch (e) { alert('Failed to save order'); }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h2 className="text-xl font-bold text-slate-800">{order ? 'Edit Back Order' : 'New Back Order'}</h2>
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
                        >
                            <option value="">Select Customer...</option>
                            {customers.map(c => (
                                <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Item Required</label>
                        <select
                            className="w-full p-3 border border-slate-200 rounded-lg bg-white"
                            value={formData.itemId}
                            onChange={e => setFormData({ ...formData, itemId: e.target.value })}
                            required
                        >
                            <option value="">Select Item...</option>
                            {items.map(i => (
                                <option key={i.id} value={i.id}>{i.name} ({i.stock} in stock)</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Quantity</label>
                            <input
                                type="number"
                                min="1"
                                className="w-full p-3 border border-slate-200 rounded-lg"
                                value={formData.quantity}
                                onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Date</label>
                            <input
                                type="date"
                                className="w-full p-3 border border-slate-200 rounded-lg"
                                value={formData.orderDate}
                                onChange={e => setFormData({ ...formData, orderDate: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Status</label>
                        <select
                            className="w-full p-3 border border-slate-200 rounded-lg bg-white"
                            value={formData.status}
                            onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                        >
                            <option value="pending">Pending</option>
                            <option value="fulfilled">Fulfilled</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>

                    <div className="flex justify-end pt-4 gap-3">
                        <button type="button" onClick={onClose} className="px-6 py-3 text-slate-500 font-bold hover:bg-slate-100 rounded-lg">Cancel</button>
                        <button type="submit" className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-200">Save Order</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
