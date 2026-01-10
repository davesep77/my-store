
import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Box, Package } from 'lucide-react';
import { Kit, Item } from '../types';
import { api } from '../services/api';

export const KitMaintenance: React.FC = () => {
    const [kits, setKits] = useState<Kit[]>([]);
    const [items, setItems] = useState<Item[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingKit, setEditingKit] = useState<Kit | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [k, i] = await Promise.all([api.getKits(), api.getItems()]);
            setKits(k);
            setItems(i);
        } catch (e) { console.error(e); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this kit?')) return;
        try {
            await api.deleteKit(id);
            loadData();
        } catch (e) { alert('Failed to delete'); }
    };

    const filteredKits = kits.filter(k => k.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="h-full bg-slate-50 flex flex-col p-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Kit Maintenance</h1>
                    <p className="text-slate-500 font-medium">Create and manage product bundles.</p>
                </div>
                <button
                    onClick={() => { setEditingKit(null); setShowModal(true); }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-200 transition-all active:scale-95"
                >
                    <Plus size={20} /> New Kit
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col flex-1 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search kits..."
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
                                <th className="px-6 py-4">Kit Name</th>
                                <th className="px-6 py-4">Description</th>
                                <th className="px-6 py-4">Components</th>
                                <th className="px-6 py-4 text-right">Price</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredKits.map(kit => (
                                <tr key={kit.id} className="hover:bg-slate-50 group">
                                    <td className="px-6 py-4 font-bold text-slate-800 flex items-center gap-3">
                                        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                                            <Box size={20} />
                                        </div>
                                        {kit.name}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 text-sm">{kit.description}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex -space-x-2">
                                            {kit.components?.slice(0, 5).map((c, i) => (
                                                <div key={i} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-600" title={c.itemId}>
                                                    {c.quantity}
                                                </div>
                                            ))}
                                            {(kit.components?.length || 0) > 5 && (
                                                <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-500">
                                                    +{kit.components!.length - 5}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono font-bold text-slate-800">
                                        {new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(kit.price || 0)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => { setEditingKit(kit); setShowModal(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={18} /></button>
                                            <button onClick={() => handleDelete(kit.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredKits.length === 0 && <tr><td colSpan={5} className="p-10 text-center text-slate-400">No kits found.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <KitFormModal
                    kit={editingKit}
                    items={items}
                    onClose={() => setShowModal(false)}
                    onSave={() => { setShowModal(false); loadData(); }}
                />
            )}
        </div>
    );
};

interface KitFormModalProps {
    kit: Kit | null;
    items: Item[];
    onClose: () => void;
    onSave: () => void;
}

const KitFormModal: React.FC<KitFormModalProps> = ({ kit, items, onClose, onSave }) => {
    const [formData, setFormData] = useState<Partial<Kit>>({
        id: '', name: '', description: '', price: 0, components: []
    });

    useEffect(() => {
        if (kit) {
            setFormData(JSON.parse(JSON.stringify(kit))); // Deep copy
        } else {
            setFormData(prev => ({ ...prev, id: 'KIT-' + Math.floor(Math.random() * 10000) }));
        }
    }, [kit]);

    const addComponent = () => {
        setFormData(prev => ({
            ...prev,
            components: [...(prev.components || []), { id: 0, kitId: prev.id!, itemId: '', quantity: 1 }]
        }));
    };

    const removeComponent = (idx: number) => {
        setFormData(prev => ({
            ...prev,
            components: prev.components?.filter((_, i) => i !== idx)
        }));
    };

    const updateComponent = (idx: number, field: string, value: any) => {
        const newComps = [...(formData.components || [])];
        newComps[idx] = { ...newComps[idx], [field]: value };
        setFormData({ ...formData, components: newComps });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (kit) await api.updateKit(formData as Kit);
            else await api.createKit(formData as Kit);
            onSave();
        } catch (e) { alert('Failed to save kit'); }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-auto flex flex-col">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h2 className="text-xl font-bold text-slate-800">{kit ? 'Edit Kit' : 'New Kit'}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-auto p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Kit ID</label>
                            <input className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg font-mono" value={formData.id} readOnly />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Price</label>
                            <input type="number" className="w-full p-3 border border-slate-200 rounded-lg" value={formData.price} onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Kit Name</label>
                        <input required className="w-full p-3 border border-slate-200 rounded-lg" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
                        <textarea className="w-full p-3 border border-slate-200 rounded-lg" rows={2} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                    </div>

                    <div className="border-t border-slate-100 pt-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-700 flex items-center gap-2"><Package size={18} /> Kit Contents</h3>
                            <button type="button" onClick={addComponent} className="text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-lg text-sm font-bold flex items-center gap-1">+ Add Item</button>
                        </div>

                        <div className="space-y-3">
                            {formData.components?.map((comp, idx) => (
                                <div key={idx} className="flex gap-3 items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <div className="flex-1">
                                        <select
                                            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm"
                                            value={comp.itemId}
                                            onChange={e => updateComponent(idx, 'itemId', e.target.value)}
                                            required
                                        >
                                            <option value="">Select Item...</option>
                                            {items.map(i => (
                                                <option key={i.id} value={i.id}>{i.name} ({i.sku})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="w-24">
                                        <input
                                            type="number"
                                            min="1"
                                            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-center font-bold text-sm"
                                            value={comp.quantity}
                                            onChange={e => updateComponent(idx, 'quantity', parseInt(e.target.value))}
                                        />
                                    </div>
                                    <button type="button" onClick={() => removeComponent(idx)} className="text-red-400 hover:text-red-600 p-2"><Trash2 size={16} /></button>
                                </div>
                            ))}
                            {(!formData.components || formData.components.length === 0) && (
                                <div className="text-center py-6 text-slate-400 text-sm bg-slate-50 rounded-xl border-dashed border-2 border-slate-200">
                                    No items in this kit yet.
                                </div>
                            )}
                        </div>
                    </div>
                </form>

                <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-6 py-3 text-slate-500 font-bold hover:bg-slate-100 rounded-lg">Cancel</button>
                    <button onClick={handleSubmit} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-200">Save Kit</button>
                </div>
            </div>
        </div>
    );
};
