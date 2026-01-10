
import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Tag, Percent } from 'lucide-react';
import { PricingRule, Item } from '../types';
import { api } from '../services/api';

export const MixMatchPricing: React.FC = () => {
    const [rules, setRules] = useState<PricingRule[]>([]);
    const [items, setItems] = useState<Item[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingRule, setEditingRule] = useState<PricingRule | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [r, i] = await Promise.all([api.getPricingRules(), api.getItems()]);
            setRules(r);
            setItems(i);
        } catch (e) { console.error(e); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this pricing rule?')) return;
        try {
            await api.deletePricingRule(id);
            loadData();
        } catch (e) { alert('Failed to delete'); }
    };

    const filteredRules = rules.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="h-full bg-slate-50 flex flex-col p-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Mix 'N Match Pricing</h1>
                    <p className="text-slate-500 font-medium">Create promotional bundles and bulk discounts.</p>
                </div>
                <button
                    onClick={() => { setEditingRule(null); setShowModal(true); }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-200 transition-all active:scale-95"
                >
                    <Plus size={20} /> New Pricing Rule
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col flex-1 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search rules..."
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
                                <th className="px-6 py-4">Rule Name</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Condition</th>
                                <th className="px-6 py-4">Effect</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredRules.map(rule => (
                                <tr key={rule.id} className="hover:bg-slate-50 group">
                                    <td className="px-6 py-4 font-bold text-slate-800 flex items-center gap-3">
                                        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                                            <Percent size={20} />
                                        </div>
                                        {rule.name}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-slate-100 rounded text-xs font-bold text-slate-600 uppercase border border-slate-200">
                                            {rule.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 font-medium">
                                        Buy <span className="font-bold text-slate-800">{rule.quantityNeeded}</span> items
                                    </td>
                                    <td className="px-6 py-4 font-bold text-green-600">
                                        {rule.discountType === 'fixed_price' ?
                                            `For ${new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(rule.discountAmount)}` :
                                            `Get ${rule.discountAmount}% Off`
                                        }
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => { setEditingRule(rule); setShowModal(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={18} /></button>
                                            <button onClick={() => handleDelete(rule.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredRules.length === 0 && <tr><td colSpan={5} className="p-10 text-center text-slate-400">No pricing rules defined.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <PricingRuleFormModal
                    rule={editingRule}
                    items={items}
                    onClose={() => setShowModal(false)}
                    onSave={() => { setShowModal(false); loadData(); }}
                />
            )}
        </div>
    );
};

interface PricingRuleFormModalProps {
    rule: PricingRule | null;
    items: Item[];
    onClose: () => void;
    onSave: () => void;
}

const PricingRuleFormModal: React.FC<PricingRuleFormModalProps> = ({ rule, items, onClose, onSave }) => {
    const [formData, setFormData] = useState<Partial<PricingRule>>({
        id: '', name: '', type: 'quantity', quantityNeeded: 2, discountAmount: 0, discountType: 'percentage_off', items: []
    });

    useEffect(() => {
        if (rule) {
            setFormData(JSON.parse(JSON.stringify(rule)));
        } else {
            setFormData(prev => ({ ...prev, id: 'RULE-' + Math.floor(Math.random() * 10000) }));
        }
    }, [rule]);

    const addItem = (itemId: string) => {
        setFormData(prev => ({
            ...prev,
            items: [...(prev.items || []), { id: 0, groupId: prev.id!, itemId }]
        }));
    };

    const removeItem = (idx: number) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items?.filter((_, i) => i !== idx)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (rule) await api.updatePricingRule(formData as PricingRule);
            else await api.createPricingRule(formData as PricingRule);
            onSave();
        } catch (e) { alert('Failed to save rule'); }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-auto flex flex-col">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h2 className="text-xl font-bold text-slate-800">{rule ? 'Edit Pricing Rule' : 'New Pricing Rule'}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 p-8 space-y-6 overflow-auto">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Rule ID</label>
                            <input className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg font-mono" value={formData.id} readOnly />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Rule Name</label>
                            <input required className="w-full p-3 border border-slate-200 rounded-lg" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. 3 for £10" />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Buy Quantity</label>
                            <input type="number" min="1" className="w-full p-3 border border-slate-200 rounded-lg" value={formData.quantityNeeded} onChange={e => setFormData({ ...formData, quantityNeeded: parseInt(e.target.value) })} />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Discount Type</label>
                            <select className="w-full p-3 border border-slate-200 rounded-lg bg-white" value={formData.discountType} onChange={e => setFormData({ ...formData, discountType: e.target.value as any })}>
                                <option value="percentage_off">Percentage Off (%)</option>
                                <option value="fixed_price">Fixed Set Price (£)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Amount</label>
                            <input type="number" step="0.01" className="w-full p-3 border border-slate-200 rounded-lg" value={formData.discountAmount} onChange={e => setFormData({ ...formData, discountAmount: parseFloat(e.target.value) })} />
                        </div>
                    </div>

                    <div className="border-t border-slate-100 pt-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-700 flex items-center gap-2"><Tag size={18} /> Included Items</h3>
                            <select
                                className="p-2 border border-slate-200 rounded-lg text-sm max-w-xs"
                                onChange={e => { if (e.target.value) addItem(e.target.value); e.target.value = ''; }}
                            >
                                <option value="">+ Add Item to Rule...</option>
                                {items.map(i => (
                                    <option key={i.id} value={i.id}>{i.name} ({i.sku})</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {formData.items?.map((item, idx) => {
                                const actualItem = items.find(i => i.id === item.itemId);
                                return (
                                    <span key={idx} className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg font-bold text-slate-700 text-sm border border-slate-200">
                                        {actualItem ? actualItem.name : 'Unknown Item'}
                                        <button type="button" onClick={() => removeItem(idx)} className="text-slate-400 hover:text-red-500 font-bold">×</button>
                                    </span>
                                );
                            })}
                            {(!formData.items || formData.items.length === 0) && (
                                <div className="w-full text-center py-6 text-slate-400 text-sm bg-slate-50 rounded-xl border-dashed border-2 border-slate-200">
                                    No items selected. Add items to apply this rule to.
                                </div>
                            )}
                        </div>
                    </div>
                </form>

                <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-6 py-3 text-slate-500 font-bold hover:bg-slate-100 rounded-lg">Cancel</button>
                    <button onClick={handleSubmit} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-200">Save Rule</button>
                </div>
            </div>
        </div>
    );
};
